import socket
import sys
import json



mariquita = True
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

def executor(data_in):
    global mariquita


    if mariquita:
        # Create a TCP/IP socket


        datatr = data_in

        # Convierte en JSON el objeto python
        filejson = json.dumps(datatr)
        print("Peticion : ", filejson)
        dict_data = eval(filejson)
        json_data = json.loads(dict_data)

        #CConectar el socket al pyerto donde el servidor está escuchando
        server_address = ('192.168.56.104', 10000)
        print('Conectoándose a {} puerto {}'.format(*server_address))
        sock.connect(server_address)
        mariquita = False
        print("Tipo: ", type(json_data))
        
            #action = json_data['action']

        if 'action' in json_data:
            print(json_data['action'])

            try:
                # Send data
                message = filejson
                print('sending {!r}', message)
                sock.sendall(message.encode())
            finally:
                mariquita = True
                sock.close()

        else:
            print("Enviar Red")
            try:
                # Send data
                message = filejson
                print('sending {!r}', message)
                sock.sendall(message.encode())

                # Look for the response
                amount_received = 0
                amount_expected = len(message)

                while amount_received < amount_expected:
                    data = sock.recv(2048)
                    amount_received += len(data)
                    resp_data = data.decode()          
                    dict_data = eval(resp_data)
                    print('Tipo:! ',type(dict))
                    json_data = json.dumps(dict_data)
                    print('received {!r}'.format(json_data))

                    for x in json_data:
                        answer = x[0]
                        if answer == 'creada':
                            print('Creada!!')
                            #sock.sendall() 

            finally:
                mariquita = True
                print('closing socket')
                sock.close()
