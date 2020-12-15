import socket
import sys
import json



class Connection():
    def __init__(self):
        self.__sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.__server_adress = ('192.168.56.104', 10000)
        self.__cache = 65000    

    def run_connection(self):
        print('Conectándose a {} puerto {}'.format(*self.__server_adress))
        self.__sock.connect(self.__server_adress)
    
    def send_message(self, msj):
        self.__sock.sendall(msj.encode())
    
    def stop_connection(self):
        self.__sock.close()
    
    def recive_message(self):
        data = self.__sock.recv(self.__cache)
        return data