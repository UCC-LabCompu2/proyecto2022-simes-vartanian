const canvas = document.getElementById('juego');
const ctx = canvas.getContext('2d');

// Variables
let puntaje;
let puntajeText;
let puntajealto;
let puntajealtoText;
let jugador;
let gravedad;
var escoba = new Image ();
escoba.src = "resources/escoba4.png";
const dementor = new Image ();
dementor.src = "resources/dementor.png"
let obstaculos = [];
let juegoVelocidad;
let keys = {};

// Hay q hacer los Event Listeners aca
document.addEventListener('keydown', function (evt) {
    keys[evt.code] = true;
});
document.addEventListener('keyup', function (evt) {
    keys[evt.code] = false;
});

class Jugador {
    constructor (x, y, w, h, c) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = c;

        this.dy = 0;
        this.saltarForce = 15;
        this.originalHeight = h;
        this.grounded = false;
        this.saltarTimer = 0;
    }

    Animate () {
        // para que salte
        if (keys['Space'] || keys['KeyW']) {
            this.Saltar();
        } else {
            this.saltarTimer = 0;
        }

        if (keys['ShiftLeft'] || keys['KeyS']) {
            this.h = this.originalHeight / 2;
        } else {
            this.h = this.originalHeight;
        }

        this.y += this.dy;

        // ahora hacmos la gravedad
        if (this.y + this.h < canvas.height) {
            this.dy += gravedad;
            this.grounded = false;
        } else {
            this.dy = 0;
            this.grounded = true;
            this.y = canvas.height - this.h;
        }

        this.Draw();
    }

    Saltar () {
        if (this.grounded && this.saltarTimer == 0) {
            this.saltarTimer = 1;
            this.dy = -this.saltarForce;
        } else if (this.saltarTimer > 0 && this.saltarTimer < 15) {
            this.saltarTimer++;
            this.dy = -this.saltarForce - (this.saltarTimer / 50);
        }
    }

    Draw () {
        ctx.beginPath();
        ctx.drawImage(escoba,this.x+30,this.y-60,100,100);
        ctx.closePath();
    }
}

class Obstaculo {
    constructor (x, y, w, h, c) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = c;

        this.dx = -juegoVelocidad;
    }

    Update () {
        this.x += this.dx;
        this.Draw();
        this.dx = -juegoVelocidad;
    }

    Draw () {
        ctx.beginPath();
        ctx.drawImage(dementor,this.x-18,this.y,this.w+30,this.h);
        ctx.closePath();
    }
}

class Text {
    constructor (t, x, y, a, c, s) {
        this.t = t;
        this.x = x;
        this.y = y;
        this.a = a;
        this.c = c;
        this.s = s;
    }

    Draw () {
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.font = this.s + "Book Antiqua";
        ctx.textAlign = this.a;
        ctx.fillText(this.t, this.x, this.y);
        ctx.closePath();
    }
}

// Game Functions
function SpawnObstaculo () {
    let size = RandomIntInRange(70, 100);
    let type = RandomIntInRange(0, 1);
    let obstaculo = new Obstaculo(canvas.width + size, canvas.height - size, size-50, size, '#2484E4');

    if (type == 1) {
        obstaculo.y -= jugador.originalHeight - 10;
    }
    obstaculos.push(obstaculo);
}


function RandomIntInRange (min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function Start () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.font = "20px sans-serif";

    juegoVelocidad = 3;
    gravedad = 1;
    puntaje= 0;
    puntajealto = 0;
    if (localStorage.getItem('puntajealto')) {
        puntajealto = localStorage.getItem('puntajealto');
    }





    jugador = new Jugador(25, 0, 50, 50, '#FF5858');

    puntajeText = new Text("Puntaje: " + puntaje, 25, 25, "left", "#FF5858", "20");
    puntajealtoText = new Text("Puntaje mas alto: " + puntajealto, canvas.width - 25, 25, "right", "#FF5858", "20");

    requestAnimationFrame(Update);
}

let initialSpawnTimer = 200;
let spawnTimer = initialSpawnTimer;
function Update () {
    requestAnimationFrame(Update);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    spawnTimer--;
    if (spawnTimer <= 0) {
        SpawnObstaculo();
        console.log(obstaculos);
        spawnTimer = initialSpawnTimer - juegoVelocidad * 8;

        if (spawnTimer < 60) {
            spawnTimer = 60;
        }
    }

    // para enemigos
    for (let i = 0; i < obstaculos.length; i++) {
        let o = obstaculos[i];

        if (o.x + o.w < 0) {
            obstaculos.splice(i, 1);
        }

        if (
            jugador.x < o.x + o.w &&
            jugador.x + jugador.w > o.x &&
            jugador.y < o.y + o.h &&
            jugador.y + jugador.h > o.y
        ) {
            alert("¡Lo sentimos Mago pero el dementor te ha alcanzado, mejor suerte la proxima!")
            obstaculos = [];
            puntaje = 0;
            spawnTimer = initialSpawnTimer;
            juegoVelocidad = 3;
            window.localStorage.setItem('puntajealto', puntajealto);
        }

        o.Update();
    }

    jugador.Animate();

    puntaje++;
    puntajeText.t = "Puntaje: " + puntaje;
    puntajeText.Draw();

    if (puntaje > puntajealto) {
        puntajealto = puntaje;
        puntajealtoText.t = "PuntajeMasAlto: " + puntajealto;
    }

    puntajealtoText.Draw();

    juegoVelocidad += 0.003;
}

Start();