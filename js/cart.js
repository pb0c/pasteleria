document.addEventListener('DOMContentLoaded', () => {

    let carrito = [];
    let historial = [];
    const divisa = '$';
    const DOMitems = document.querySelector('#items');
    const DOMcarrito = document.querySelector('#carrito');
    const DOMtotal = document.querySelector('#total');
    const DOMbotonVaciar = document.querySelector('#boton-vaciar');
    const DOMbotonComprar = document.querySelector('#boton-comprar');
    const DOMbotonHistorial = document.querySelector('#boton-historial');
    const miLocalStorage = window.localStorage;

    function renderizarProductos() {
        baseDeDatos.forEach((info) => {

            const miNodo = document.createElement('div');
            miNodo.classList.add('card', 'col-sm-4');

            const miNodoCardBody = document.createElement('div');
            miNodoCardBody.classList.add('card-body');

            const miNodoTitle = document.createElement('h5');
            miNodoTitle.classList.add('card-title');
            miNodoTitle.textContent = info.nombre;

            const miNodoImagen = document.createElement('img');
            miNodoImagen.classList.add('img-fluid');
            miNodoImagen.setAttribute('src', info.imagen);

            const miNodoPrecio = document.createElement('p');
            miNodoPrecio.classList.add('card-text');
            miNodoPrecio.textContent = `${divisa}${info.precio}`;

            const miNodoBoton = document.createElement('button');
            miNodoBoton.classList.add('btn', 'btn-primary');
            miNodoBoton.textContent = '+';
            miNodoBoton.setAttribute('marcador', info.id);
            miNodoBoton.addEventListener('click', addProductoAlCarrito);

            miNodoCardBody.appendChild(miNodoImagen);
            miNodoCardBody.appendChild(miNodoTitle);
            miNodoCardBody.appendChild(miNodoPrecio);
            miNodoCardBody.appendChild(miNodoBoton);
            miNodo.appendChild(miNodoCardBody);
            DOMitems.appendChild(miNodo);
        });
    }

    //añadir producto a carro
    function addProductoAlCarrito(evento) {
        carrito.push(evento.target.getAttribute('marcador'))
        renderizarCarrito();
        guardarCarritoEnLocalStorage();
    }

    //mostrar prod carro
    function renderizarCarrito() {
        DOMcarrito.textContent = '';
        const carritoSinDuplicados = [...new Set(carrito)];
        carritoSinDuplicados.forEach((item) => {
            const miItem = baseDeDatos.filter((itemBaseDatos) => {
                return itemBaseDatos.id === parseInt(item);
            });

            const numeroUnidadesItem = carrito.reduce((total, itemId) => {
                return itemId === item ? total += 1 : total;
            }, 0);

            const miNodo = document.createElement('li');
            miNodo.classList.add('list-group-item', 'text-right', 'mx-2');
            miNodo.textContent = numeroUnidadesItem + ' x ' + miItem[0].nombre + ' - ' + divisa + miItem[0].precio;


            //boton borrar
            const miBoton = document.createElement('button');
            miBoton.classList.add('btn', 'btn-danger', 'mx-5');
            miBoton.textContent = 'X';
            miBoton.style.marginLeft = '1rem';
            miBoton.dataset.item = item;
            miBoton.onclick = borrarItemCarrito;

            miNodo.appendChild(miBoton);
            DOMcarrito.appendChild(miNodo);
        });

        DOMtotal.textContent = calcularTotal();
    }

    //eliminar  elemento
    function borrarItemCarrito(evento) {
        const id = evento.target.dataset.item;

        carrito = carrito.filter((carritoId) => {
            return carritoId !== id;
        });

        Toastify({
            text: "Se ha eliminado el producto",
            duration: 2000
        }).showToast();

        renderizarCarrito();
        guardarCarritoEnLocalStorage();

    }

    //calc total
    function calcularTotal() {
        return carrito.reduce((total, item) => {
            const miItem = baseDeDatos.filter((itemBaseDatos) => {
                return itemBaseDatos.id === parseInt(item);
            });

            return total + miItem[0].precio;
        }, 0);
    }

    DOMbotonVaciar.onclick = vaciarCarrito;

    //vaciar carro
    function vaciarCarrito() {
        if (carrito.length !== 0) {
            carrito = [];
            Swal.fire({
                title: 'Desea vaciar carrito',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {

                if (result.isConfirmed) {
                    renderizarCarrito();
                    localStorage.clear();

                    Swal.fire({
                        title: 'Se ha vaciado el carrito',
                        icon: 'success'
                    })
                } else {
                    cargarCarritoDeLocalStorage();
                };
            });
        } else {
            Swal.fire('El carrito está vacío');
        }
    }

    function comprarProducto() {
        console.log(carrito.length)
        if (carrito.length === 0) {
            Swal.fire('El carrito está vacío');
        } else {
            historial.push([...carrito]);
            Swal.fire('Se ha realizado su compra');

            carrito = [];
            renderizarCarrito();
            guardarCarritoEnLocalStorage();
        }
    }

    DOMbotonComprar.onclick = comprarProducto;

    function guardarCarritoEnLocalStorage() {
        miLocalStorage.setItem('carrito', JSON.stringify(carrito));
    }

    function cargarCarritoDeLocalStorage() {
        if (miLocalStorage.getItem('carrito') !== null) {
            carrito = JSON.parse(miLocalStorage.getItem('carrito'));
        }
    }

    async function detalleProducto(productoId) {
        return new Promise((resolve, reject) => {
            const producto = baseDeDatos.find(item => item.id === parseInt(productoId));
            if (producto) {
                resolve({ nombre: producto.nombre, cantidad: 1 });
            } else {
                reject(new Error('Id ' + productoId + ' no encontrado'));
            }
        });
    }

    async function verHistorial() {
        if (historial.length === 0) {
            Swal.fire('No se ha encontrado historial de compras');
            return;
        }
        const histDetalle = [];
        for (let i = 0; i < historial.length; i++) {
            const prodDetalle = [];
            for (const productoId of historial[i]) {
                try {
                    const detalle = await detalleProducto(productoId);
                    prodDetalle.push(`${detalle.nombre} - Cantidad: ${detalle.cantidad}`);
                } catch (error) {
                    Swal.fire('Error ' + error.message);
                    return;
                }
            }
            histDetalle.push(`Compra ${i + 1}: ${prodDetalle.join(', ')}`);
        }
        Swal.fire('Historial de compras:\n' + histDetalle.join('\n'));
    }


    DOMbotonHistorial.onclick = verHistorial;

    cargarCarritoDeLocalStorage();
    renderizarProductos();
    renderizarCarrito();

});