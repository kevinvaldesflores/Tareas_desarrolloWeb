// Clase Empleado
class Empleado {
    constructor(id, nombre, apellido, email, telefono, salario, fechaNacimiento, imagen = null) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.telefono = telefono;
        this.salario = parseFloat(salario);
        this.fechaNacimiento = fechaNacimiento;
        this.imagen = imagen || this.generarAvatarPorDefecto();
        this.fechaRegistro = new Date().toISOString();
    }

    generarAvatarPorDefecto() {
        const iniciales = (this.nombre[0] + this.apellido[0]).toUpperCase();
        return `https://ui-avatars.com/api/?background=667eea&color=fff&size=100&name=${iniciales}`;
    }

    getNombreCompleto() {
        return `${this.nombre} ${this.apellido}`;
    }

    getEdad() {
        const hoy = new Date();
        const nacimiento = new Date(this.fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    }

    formatearSalario() {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'USD'
        }).format(this.salario);
    }
}

// Clase BaseDeDatosEmpleados
class BaseDeDatosEmpleados {
    constructor() {
        this.empleados = this.cargarEmpleados();
    }

    cargarEmpleados() {
        const empleadosGuardados = localStorage.getItem('empleados');
        if (empleadosGuardados) {
            return JSON.parse(empleadosGuardados);
        }
        return [];
    }

    guardarEmpleados() {
        localStorage.setItem('empleados', JSON.stringify(this.empleados));
    }

    agregarEmpleado(empleado) {
        this.empleados.push(empleado);
        this.guardarEmpleados();
        return empleado;
    }

    eliminarEmpleado(id) {
        this.empleados = this.empleados.filter(emp => emp.id !== id);
        this.guardarEmpleados();
    }

    obtenerEmpleadoPorId(id) {
        return this.empleados.find(emp => emp.id === id);
    }

    obtenerTodosEmpleados() {
        return [...this.empleados];
    }

    buscarEmpleados(termino) {
        const terminoLower = termino.toLowerCase();
        return this.empleados.filter(emp => 
            emp.nombre.toLowerCase().includes(terminoLower) ||
            emp.apellido.toLowerCase().includes(terminoLower) ||
            emp.email.toLowerCase().includes(terminoLower) ||
            emp.telefono.includes(termino)
        );
    }
}

// Clase UI
class UI {
    constructor() {
        this.db = new BaseDeDatosEmpleados();
        this.form = document.getElementById('employeeForm');
        this.employeesList = document.getElementById('employeesList');
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.agregarEmpleado(e));
        this.renderizarEmpleados();
    }

    agregarEmpleado(e) {
        e.preventDefault();

        // Obtener valores del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const apellido = document.getElementById('apellido').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const salario = document.getElementById('salario').value;
        const fechaNacimiento = document.getElementById('fechaNacimiento').value;
        const imagen = document.getElementById('imagen').value.trim();

        // Validaciones
        if (!nombre || !apellido || !email || !telefono || !salario || !fechaNacimiento) {
            this.mostrarMensaje('Por favor, complete todos los campos obligatorios', 'error');
            return;
        }

        if (salario <= 0) {
            this.mostrarMensaje('El salario debe ser mayor a 0', 'error');
            return;
        }

        const fechaNac = new Date(fechaNacimiento);
        const hoy = new Date();
        if (fechaNac > hoy) {
            this.mostrarMensaje('La fecha de nacimiento no puede ser futura', 'error');
            return;
        }

        // Validar email único
        const emailExiste = this.db.obtenerTodosEmpleados().some(emp => emp.email === email);
        if (emailExiste) {
            this.mostrarMensaje('Ya existe un empleado con este email', 'error');
            return;
        }

        // Crear nuevo empleado
        const id = Date.now().toString();
        const nuevoEmpleado = new Empleado(
            id, nombre, apellido, email, telefono, salario, fechaNacimiento, imagen
        );

        this.db.agregarEmpleado(nuevoEmpleado);
        this.renderizarEmpleados();
        this.form.reset();
        this.mostrarMensaje('Empleado agregado exitosamente', 'success');
    }

    eliminarEmpleado(id) {
        if (confirm('¿Está seguro de que desea eliminar este empleado?')) {
            this.db.eliminarEmpleado(id);
            this.renderizarEmpleados();
            this.mostrarMensaje('Empleado eliminado exitosamente', 'success');
        }
    }

    renderizarEmpleados() {
        const empleados = this.db.obtenerTodosEmpleados();
        
        if (empleados.length === 0) {
            this.employeesList.innerHTML = `
                <div class="empty-state">
                    🏢 No hay empleados registrados
                    <br>
                    <small>Agrega el primer empleado usando el formulario</small>
                </div>
            `;
            return;
        }

        this.employeesList.innerHTML = empleados.map(emp => `
            <div class="employee-card" data-id="${emp.id}">
                <button class="delete-btn" onclick="ui.eliminarEmpleado('${emp.id}')">×</button>
                <div style="text-align: center;">
                    <img src="${emp.imagen}" alt="${emp.getNombreCompleto()}" class="employee-avatar" 
                         onerror="this.src='https://ui-avatars.com/api/?background=667eea&color=fff&size=100&name=${emp.nombre[0]}${emp.apellido[0]}'">
                </div>
                <div class="employee-info">
                    <div class="employee-name">${emp.getNombreCompleto()}</div>
                    <div class="employee-detail">
                        📧 ${emp.email}
                    </div>
                    <div class="employee-detail">
                        📱 ${emp.telefono}
                    </div>
                    <div class="employee-detail">
                        💰 ${emp.formatearSalario()}
                    </div>
                    <div class="employee-detail">
                        🎂 ${new Date(emp.fechaNacimiento).toLocaleDateString()} (${emp.getEdad()} años)
                    </div>
                    <div class="employee-detail">
                        📅 Registrado: ${new Date(emp.fechaRegistro).toLocaleDateString()}
                    </div>
                </div>
            </div>
        `).join('');
    }

    mostrarMensaje(mensaje, tipo) {
        const mensajeDiv = document.createElement('div');
        mensajeDiv.textContent = mensaje;
        mensajeDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${tipo === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;

        document.body.appendChild(mensajeDiv);
        
        setTimeout(() => {
            mensajeDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => mensajeDiv.remove(), 300);
        }, 3000);
    }
}

// Inicializar la aplicación
let ui;
document.addEventListener('DOMContentLoaded', () => {
    ui = new UI();
    
    // Agregar estilos para animaciones
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

