const fs = require('fs');
const path = require('path');
function fix(file) {
    let t = fs.readFileSync(file, 'utf8');
    t = t.replace(/INFORMACIN/g, 'INFORMACIÓN');
    t = t.replace(/Configuracin/g, 'Configuración');
    t = t.replace(/Tel.fono/g, 'Teléfono');
    t = t.replace(/contrasea/g, 'contraseña');
    t = t.replace(/Aseg.rate/g, 'Asegúrate');
    t = t.replace(/Navegacin/g, 'Navegación');
    t = t.replace(/b.sicos/g, 'básicos');
    t = t.replace(/ver.n/g, 'verán');
    t = t.replace(/difcil/g, 'difícil');
    t = t.replace(/SESIN/g, 'SESIÓN');
    fs.writeFileSync(file, t, 'utf8');
}
fix('src/blueprints/profile-page/profile-page.component.html');
fix('src/blueprints/settings-page/settings-page.component.html');
console.log('Fixed encodings in -Atomic-UI');
