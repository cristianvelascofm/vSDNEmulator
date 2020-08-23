from django.shortcuts import render
from django.http import HttpResponse

def alambric_emulator(request):
    msg=''
    return render(request, 'alambric_emulator.html')
    #if request.method == "POST" and request.is_ajax():        
    #    print (request.POST)
    #    msg="AJAX post invalid"
   # else:
    #    msg = "GET petitions are not allowed for this view."

   # return HttpResponse(msg)