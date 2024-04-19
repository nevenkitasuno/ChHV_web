const inp = document.getElementById("message");
const outp = document.getElementById("output");

inp.addEventListener("input", greet);

function greet() {
    let txt = inp.value;
    outp.textContent = txt;
}