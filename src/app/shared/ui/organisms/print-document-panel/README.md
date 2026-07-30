# PrintDocumentPanel

Organismo genérico para previsualizar y enviar a impresión un paquete de
documentos A4. Recibe páginas, campos, secciones, tablas y firmas tipadas; el
consumidor conserva el contenido y las reglas de negocio.

La impresión crea un documento aislado, inserta todos los valores con
`textContent`, usa papel A4 vertical y espera dos ciclos de render antes de
abrir el diálogo del navegador.
