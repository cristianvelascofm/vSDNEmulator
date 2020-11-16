import socket
import sys
import json




datatr = {}


def load_data(d):
    datatr= d
    # Convierte en JSON el objeto python
    filejson = json.dumps(datatr,sort_keys=True, indent=4)
    print("Resutlado Final : ",filejson)


    # Create a TCP/IP socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # Connect the socket to the port where the server is listening
    server_address = ('10.55.6.146', 10000)
    print('connecting to {} port {}'.format(*server_address))
    sock.connect(server_address)

    try:
            # Send data
            message = filejson
            print('sending {!r}',message)
            sock.sendall(message.encode())

            # Look for the response
            amount_received = 0
            amount_expected = len(message)

            while amount_received < amount_expected:
                    data = sock.recv(1024)
                    data = sock.recv(1024)
                    amount_received += len(data)
                    print('received {!r}'.format(data))

    finally:
            print('closing socket')
            sock.close()