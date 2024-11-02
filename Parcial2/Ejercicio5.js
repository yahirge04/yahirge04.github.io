const body = document.body;


//fetch consulta a una url mediande de los verbos de http
async function consultarPokemon() 
{
    
    for (let i = 1;i <= 151;i++) {
    const api="http://pokeapi.co/api/v2/pokemon/"+i+"/";
    let consulta= await fetch(api);
    let datos= await consulta.json();
    //dibujarPokemon(datos);       

    

    const newDiv = document.createElement('div');

    let rutaImagen=datos.sprites.other.home.front_default;

    
    newDiv.innerHTML = `<h1>${datos.name}<h1><img src="${rutaImagen}"/>`;
    

    body.appendChild(newDiv);


        
    }

}







consultarPokemon();