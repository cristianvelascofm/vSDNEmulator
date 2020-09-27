from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.generic import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator



class emulationView(View):


    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = request.body
        print(data.decode(encoding='utf-8'))
        return JsonResponse({'hola': 'mundo'})

    def get(self, request, *args, **kwargs):
        #return JsonResponse({'que contas': 'nada'})
        return render(request, 'alambric_emulator.html')



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