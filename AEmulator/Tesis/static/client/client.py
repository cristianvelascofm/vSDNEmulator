import socket
import sys
import json


def load_data(data_in):

    datatr = data_in
    
    # Convierte en JSON el objeto python
    filejson = json.dumps(datatr)
    print("Resutlado Final : ", filejson)

    # Conexión con wireshark a través de Xming
      


    # Create a TCP/IP socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    #sock_w = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # Connect the socket to the port where the server is listening
    server_address = ('192.168.56.103', 10000)
    #server_address_w = ('192.168.56.103', 11000)
    print('connecting to {} port {}'.format(*server_address))
    #print('connecting to {} port {}'.format(*server_address_w))
    sock.connect(server_address)
    #sock_w.connect(server_address_w)

    try:
        # Send data
        message = filejson
        print('sending {!r}', message)
        sock.sendall(message.encode())

        # Look for the response
        amount_received = 0
        amount_expected = len(message)

        while amount_received < amount_expected:
            data = sock.recv(1024)
            amount_received += len(data)
            print('received {!r}'.format(data))

           
    finally:
        print('closing socket')
        sock.close()



