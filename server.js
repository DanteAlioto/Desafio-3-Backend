const express = require("express");
const fs = require('fs');

class Contenedor {

    nextId;
    arrayObj = new Array();

    constructor(archivo) {
        this.archivo = archivo;
        if (fs.existsSync(archivo)) {
            this.arrayObj = JSON.parse(fs.readFileSync(this.archivo, "utf-8"));
            this.nextId = this.NextId();
            console.log("existe");
        } else {
            this.nextId = 0;
            fs.writeFileSync(this.archivo, JSON.stringify(this.arrayObj));
            console.log("No existe");
        }
    }

    async save(object) {
        try {
            if (!this.existFile(object)) {
                object["id"] = this.nextId;
                this.nextId++;
                this.arrayObj.push(object);
                await fs.promises.writeFile(this.archivo, JSON.stringify(this.arrayObj));
                console.log("se guardo el objeto con el id: " + object.id);
                return Promise.resolve(object.id);
            } else {
                console.log("El objeto ya existe");
            }
        } catch (err) {
            console.log(err);
        }
    }


    existFile(obj) {
        let response = false;
        this.arrayObj.forEach(element => {
            if (element.title == obj.title && element.price == obj.price && element.thumbnail == obj.thumbnail) {
                response = true;
            }
        });
        return response;
    }

    NextId() {
        if (this.arrayObj.length > 0) {
            let maxId = this.arrayObj.reduce((acc, current) => {
                return Math.max(acc, current.id)
            }, 0)
            return maxId + 1;
        } else {
            return 0;
        }
    }

    async getAll() {
        try {
            const data = await fs.promises.readFile(this.archivo, "utf-8");
            this.arrayObj = JSON.parse(data);
            console.log(this.arrayObj);
        } catch (err) {
            console.log(err);
        }
    }

    async getById(id) {
        let obj = null;
        this.arrayObj.map((element) => {
            if (element.id == id) {
                obj = element;
            }
        })
        console.log(obj);
    }



    async deleteById(id) {
        let flag = false;
        for (let i = 0; i < this.arrayObj.length; i++) {
            if (this.arrayObj[i].id === id) {
                flag = true;
                this.arrayObj.splice(i, 1);
                i--;
            }
        }

        if (flag) {
            try {
                await fs.promises.writeFile(this.archivo, JSON.stringify(this.arrayObj))
                console.log("borro el objeto de id: " + id);
            } catch (err) {
                console.log(err);
            }
        } else {
            console.log("El ID no existe");
        }
    }

    async deleteAll() {
        this.arrayObj = [];
        try {
            await fs.promises.writeFile(this.archivo, JSON.stringify(this.arrayObj))
            console.log("Se borraron todos los objetos de: " + this.archivo);
        } catch (err) {
            console.log(err);
        }
    }
}

const app = express(); // Existe una funcion express() al importar express
const productosContenedor = new Contenedor("./productos.txt");

app.get("/", (req, res) => {
        res.send('DESAFIO 3')
        
});



app.get("/productos", (req, res) => {
    productosContenedor.getAll()
        .then(productos => res.send(JSON.stringify(productos, null, 2)))
        .catch(err => console.log(err))
});


app.get("/productosRandom", (req, res) => {
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    productosContenedor.getById(getRandomInt(6))
        .then(productos => res.send(JSON.stringify(productos, null, 2)))
        .catch(err => console.log(err))
});


const server = app.listen(8080, (req, res) => {
    console.log("Escuchando en 8080");
});