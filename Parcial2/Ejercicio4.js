// api document: acceder a los elementos
//del árbol DOM

const boton= document.getElementById("btn");
const contenedor= document.getElementById("contenedor");
console.log(boton)

var contador=0;


boton.addEventListener(`click`, function (){
    contador ++
    console.log("Total de clicks " + contador)
    template=`<div> El total de click es 
            ${contador}
            </div>`;
    
    contenedor.insertAdjacentElement('beforeend', template);

})