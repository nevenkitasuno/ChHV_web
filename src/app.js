const inp = document.getElementById("message");
const outp = document.getElementById("output");

inp.addEventListener("change", greet);

function greet() {
    let txt = inp.value;
    outp.textContent = txt;
}