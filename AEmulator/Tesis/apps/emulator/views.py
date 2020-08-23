from django.shortcuts import render
from django.http import HttpResponse

def alambric_emulator(request):
    msg=''
    print('Este es el request: '+ str(request))
    if request.method == "POST":        
        print('aqui estoy')
        print (request.POST)
        print(request.body)
        print(request.data)
        msg="AJAX post invalid"
    else:
        print('aqui estoy2')
        msg = "GET petitions are not allowed for this view."

    return render(request, 'alambric_emulator.html')
   # return HttpResponse(msg)