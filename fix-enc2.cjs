const fs = require('fs');
function fix(file) {
    let t = fs.readFileSync(file, 'utf8');
    t = t.replace(/Configuraci\ufffdn/g, 'Configuración');
    t = t.replace(/Configuracin/g, 'Configuración');
    t = t.replace(/Informacin/g, 'Información');
    t = t.replace(/contrasea/g, 'contraseña');
    t = t.replace(/Tel\ufffdfono/g, 'Teléfono');
    t = t.replace(/Tel.fono/g, 'Teléfono');
    t = t.replace(/Navegacin/g, 'Navegación');
    t = t.replace(/b.sicos/g, 'básicos');
    t = t.replace(/ver.n/g, 'verán');
    t = t.replace(/dif.cil/g, 'difícil');
    t = t.replace(/Aseg.rate/g, 'Asegúrate');
    t = t.replace(/SESI\ufffdN/g, 'SESIÓN');
    fs.writeFileSync(file, t, 'utf8');
}
fix('src/blueprints/profile-page/profile-page.component.html');
fix('src/blueprints/settings-page/settings-page.component.html');
fix('src/app/shared/ui/templates/auth-layout/auth-layout.component.html');
console.log('Fixed encodings!');
