#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <ctype.h>

#if defined(_WIN32) || defined(_WIN64)
    #include <winsock2.h>
    #include <ws2tcpip.h>
    #pragma comment(lib, "ws2_32.lib")
#else
    #include <unistd.h>
    #include <sys/types.h>
    #include <sys/socket.h>
    #include <netinet/in.h>
    #include <arpa/inet.h>
    #include <netdb.h>
    #define SOCKET int
    #define INVALID_SOCKET -1
    #define closesocket(s) close(s)
#endif

#define SIP_PORT 5060
#define FAKE_IP "10.0.0.1"
#define FAKE_PORT 12345
#define TIMEOUT_SECONDS 10

// strcasestr para Windows
#if defined(_WIN32) || defined(_WIN64)
char* strcasestr(const char* haystack, const char* needle) {
    // ... (mantém a implementação original)
}
#endif

void generate_random_string(char *s, const int len) {
    static const char alphanum[] =
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for (int i = 0; i < len; ++i) {
        s[i] = alphanum[rand() % (sizeof(alphanum) - 1)];
    }
    s[len] = '\0';
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "Uso: %s <host_do_servidor_sip>\n", argv[0]);
        return 1;
    }

    #if defined(_WIN32) || defined(_WIN64)
        WSADATA wsaData;
        if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
            printf("WSAStartup falhou\n");
            return 1;
        }
    #endif

    const char *server_hostname = argv[1];
    SOCKET sockfd = INVALID_SOCKET;
    struct sockaddr_in serv_addr, local_addr;
    struct hostent *server;
    char buffer[4096];
    int ret_code = 0;

    srand(time(NULL));

    // Resolve hostname
    server = gethostbyname(server_hostname);
    if (server == NULL) {
        fprintf(stderr, "ERRO: Não foi possível resolver o hostname '%s'\n", server_hostname);
        ret_code = 1;
        goto cleanup;
    }
    char *server_ip = inet_ntoa(*(struct in_addr *)server->h_addr_list[0]);
    printf("Host resolvido para: %s\n", server_ip);

    // Cria socket
    sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if (sockfd == INVALID_SOCKET) {
        fprintf(stderr, "ERRO ao abrir o socket\n");
        ret_code = 1;
        goto cleanup;
    }

    // Associa o socket a uma interface local
    memset(&local_addr, 0, sizeof(local_addr));
    local_addr.sin_family = AF_INET;
    local_addr.sin_addr.s_addr = INADDR_ANY;
    local_addr.sin_port = htons(0);
    if (bind(sockfd, (struct sockaddr *)&local_addr, sizeof(local_addr)) < 0) {
        fprintf(stderr, "ERRO ao associar o socket\n");
        ret_code = 1;
        goto cleanup;
    }

    // Configura timeout
    #if defined(_WIN32) || defined(_WIN64)
        DWORD timeout = TIMEOUT_SECONDS * 1000;
        setsockopt(sockfd, SOL_SOCKET, SO_RCVTIMEO, (const char*)&timeout, sizeof(timeout));
    #else
        struct timeval tv;
        tv.tv_sec = TIMEOUT_SECONDS;
        tv.tv_usec = 0;
        setsockopt(sockfd, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));
    #endif

    // Configura endereço do servidor
    memset(&serv_addr, 0, sizeof(serv_addr));
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(SIP_PORT);
    memcpy(&serv_addr.sin_addr.s_addr, server->h_addr, server->h_length);

    // Constrói mensagem REGISTER
    char call_id[33], branch_id[17];
    generate_random_string(call_id, 32);
    generate_random_string(branch_id, 16);
    snprintf(buffer, sizeof(buffer),
             "REGISTER sip:%s SIP/2.0\r\n"
             "Via: SIP/2.0/UDP %s:%d;branch=z9hG4bK-%s;rport\r\n"
             "Max-Forwards: 70\r\n"
             "From: <sip:detector@%s>;tag=12345\r\n"
             "To: <sip:detector@%s>\r\n"
             "Call-ID: %s\r\n"
             "CSeq: 1 REGISTER\r\n"
             "Contact: <sip:detector@%s:%d>\r\n"
             "User-Agent: C SIP ALG Detector\r\n"
             "Content-Length: 0\r\n\r\n",
             server_hostname, FAKE_IP, FAKE_PORT, branch_id,
             FAKE_IP, server_hostname, call_id,
             FAKE_IP, FAKE_PORT);

    printf("--- MENSAGEM SIP ---\n%s------------------------------------\n", buffer);

    // Envia mensagem
    if (sendto(sockfd, buffer, strlen(buffer), 0, (struct sockaddr *)&serv_addr, sizeof(serv_addr)) < 0) {
        fprintf(stderr, "ERRO ao enviar pacote\n");
        ret_code = 1;
        goto cleanup;
    }

    // Recebe resposta
    memset(buffer, 0, sizeof(buffer));
    int n = recvfrom(sockfd, buffer, sizeof(buffer) - 1, 0, NULL, NULL);
    if (n < 0) {
        printf("Nenhuma resposta recebida do servidor.\n");
        ret_code = 1;
        goto cleanup;
    }

    buffer[n] = '\0';
    printf("--- RESPOSTA RECEBIDA ---\n%s--------------------------\n", buffer);

    // Verifica código de status
    if (strncmp(buffer, "SIP/2.0 ", 8) == 0) {
        int status_code = atoi(buffer + 8);
        printf("Código de status SIP: %d\n", status_code);
        if (status_code == 401 || status_code == 403) {
            printf("   Servidor requer autenticação. Teste inconclusivo.\n");
            ret_code = 1;
            goto cleanup;
        }
    }

    // Analisa cabeçalho Via
    char *via_header_start = strcasestr(buffer, branch_id);
    if (via_header_start) {
        char *via_line_start = via_header_start;
        while (via_line_start > buffer && *(via_line_start - 1) != '\n') {
            via_line_start--;
        }
        char *via_header_end = strstr(via_line_start, "\r\n");
        if (via_header_end) {
            *via_header_end = '\0';
            printf("   Cabeçalho 'Via' correspondente: %s\n", via_line_start);
            if (strstr(via_line_start, FAKE_IP)) {
                printf("\n RESULTADO: Nenhum SIP ALG detectado.\n");
            } else {
                printf("\n RESULTADO: SIP ALG DETECTADO!\n");
            }
        }
    } else {
        printf("   Não foi possível encontrar o cabeçalho 'Via' correspondente.\n");
    }

cleanup:
    if (sockfd != INVALID_SOCKET) {
        closesocket(sockfd);
    }
    #if defined(_WIN32) || defined(_WIN64)
        WSACleanup();
    #endif
    return ret_code;
}