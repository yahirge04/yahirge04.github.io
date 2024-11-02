var pokemon;
let array = [];
let imagen;
let correcto = 0;
let incorrecto = 0;

async function consultarPokemon(min,max) 
{
let res
let img = document.getElementById('miDiv')
array = [];

 for (let i = 1; i <= 4; i++) {
    let a=getRandomInt(min, max)
    array[i] = await consulta(a)
    res = 'res'+i
    let input = document.getElementById(res)
    if (input) {
        input.value = array[i].nombre
    }
 }
imagen = getRandomInt(1, 4)
img.style.backgroundImage = "url('"+array[imagen].imgen+"')"
}

async function consulta(a){
    const api="http://pokeapi.co/api/v2/pokemon/"+a+"/";
    let consulta= await fetch(api);
    let datos= await consulta.json();
    let nombrep = datos.name;
    let img = datos.sprites.other.home.front_default;
    pokemon={
        nombre:nombrep,
        imgen:img
    }
    return pokemon;
}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); 
}

function validar(event) {
   let respuesta = event.value
   if (respuesta == array[imagen].nombre) {
    console.log("le atinaste perro")
    correcto++
    console.log(correcto)
    contadorC.textContent = "Correcto: " + correcto;

    consultarPokemon(1,151);


   } else{
    console.log("no")
    incorrecto++
    contadorI.textContent = "Incorrecto: " + incorrecto

      if(incorrecto==3){
        correcto = 0;
        incorrecto = 0;
        contadorC.textContent = "Correcto: " + correcto;
        contadorI.textContent = "Incorrecto: " + incorrecto;
    }
    
   }
   
 

}
