import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDoNbBupPeinpHWbMdvMmwv5WyvW39FzXI",
  authDomain: "repertorio-musical-2020d.firebaseapp.com",
  databaseURL: "https://repertorio-musical-2020d-default-rtdb.firebaseio.com",
  projectId: "repertorio-musical-2020d",
  storageBucket: "repertorio-musical-2020d.firebasestorage.app",
  messagingSenderId: "752323508273",
  appId: "1:752323508273:web:c6a4a2d24e92edf53dbd10"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const songsRef = ref(database, 'repertorio_canciones');

document.addEventListener('DOMContentLoaded', () => {
    const songForm = document.getElementById('song-form');
    const songNameInput = document.getElementById('song-name');
    const songStatusInput = document.getElementById('song-status');
    const songListContainer = document.getElementById('song-list');

    // Array principal de canciones
    let songs = [];

    // Guardar en Firebase
    const saveSongs = () => {
        set(songsRef, songs);
    };

    // Escuchar cambios de Firebase en tiempo real
    onValue(songsRef, (snapshot) => {
        const data = snapshot.val();
        songs = data ? data : [];
        renderSongs();
    });

    // Renderizar la lista 
    const renderSongs = () => {
        songListContainer.innerHTML = '';
        
        if (songs.length === 0) {
            songListContainer.innerHTML = `
                <div class="empty-state">
                    <p>Tu repertorio está vacío. ¡Agrega tu primera canción!</p>
                </div>
            `;
            return;
        }

        songs.forEach((song, index) => {
            const row = document.createElement('div');
            row.className = 'song-row';

            // Columna: Número
            const colNum = document.createElement('div');
            colNum.className = 'col col-num';
            colNum.textContent = index + 1;

            // Columna: Canción
            const colName = document.createElement('div');
            colName.className = 'col col-name song-name-text';
            colName.textContent = song.name;

            // Columna: Estado (con interactividad para cambiarlo rápido)
            const colStatus = document.createElement('div');
            colStatus.className = 'col col-status';
            
            const statusBadge = document.createElement('div');
            const isRehearsed = song.rehearsed;
            
            // Lógica de colores según estado
            statusBadge.className = `status-badge ${isRehearsed ? 'status-true' : 'status-false'}`;
            statusBadge.innerHTML = isRehearsed 
                ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px"><polyline points="20 6 9 17 4 12"></polyline></svg> Ensayada' 
                : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> No ensayada';
            statusBadge.title = 'Haz clic para cambiar el estado';
            
            // Permitir cambiar estado al hacer clic en un badge
            statusBadge.addEventListener('click', () => {
                songs[index].rehearsed = !songs[index].rehearsed;
                saveSongs();
                renderSongs();
            });
            
            colStatus.appendChild(statusBadge);

            // Columna: Botón Eliminar
            const colActions = document.createElement('div');
            colActions.className = 'col col-actions';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-icon';
            deleteBtn.title = 'Eliminar canción';
            deleteBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            `;
            
            deleteBtn.addEventListener('click', () => {
                // Animación de salida antes de borrar
                row.style.opacity = '0';
                row.style.transform = 'translateX(-20px)';
                setTimeout(() => {
                    songs.splice(index, 1);
                    saveSongs();
                    renderSongs();
                }, 300);
            });

            colActions.appendChild(deleteBtn);

            row.appendChild(colNum);
            row.appendChild(colName);
            row.appendChild(colStatus);
            row.appendChild(colActions);

            songListContainer.appendChild(row);
        });
    };

    // Agregar nueva canción
    songForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = songNameInput.value.trim();
        const rehearsed = songStatusInput.value === 'true';

        if (name) {
            songs.push({
                id: Date.now(),
                name: name,
                rehearsed: rehearsed
            });
            
            saveSongs();
            renderSongs();
            
            // Limpiar formulario y mantener foco
            songNameInput.value = '';
            songStatusInput.value = 'false';
            songNameInput.focus();
        }
    });

    // El render inicial ahora es manejado automáticamente por onValue() de Firebase

    // Exportar a Excel (.xlsx con diseño)
    const exportExcelBtn = document.getElementById('export-excel-btn');
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', async () => {
            if (songs.length === 0) {
                alert("No hay canciones para exportar. ¡Agrega algunas primero!");
                return;
            }

            // Cambiar texto de botón para mostrar carga
            const originalText = exportExcelBtn.innerHTML;
            exportExcelBtn.innerHTML = 'Generando...';
            exportExcelBtn.disabled = true;

            try {
                // Crear un nuevo documento de Excel
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Mi Repertorio');

                // Configurar columnas
                worksheet.columns = [
                    { header: 'Nº', key: 'num', width: 8 },
                    { header: 'Canción', key: 'name', width: 45 },
                    { header: 'Estado', key: 'status', width: 25 }
                ];

                // Dar estilo a la cabecera
                const headerRow = worksheet.getRow(1);
                headerRow.font = { name: 'Arial', family: 4, size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
                headerRow.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF0F172A' } // Azul muy oscuro (fondo interfaz)
                };
                headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

                // Agregar datos y estilo a las celdas
                songs.forEach((song, index) => {
                    const row = worksheet.addRow({
                        num: index + 1,
                        name: song.name,
                        status: song.rehearsed ? 'YA ENSAYADA' : 'NO ENSAYADA'
                    });

                    // Estilo a la celda del número
                    const numCell = row.getCell(1);
                    numCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF94A3B8' } };
                    numCell.alignment = { vertical: 'middle', horizontal: 'center' };

                    // Estilo a la celda del nombre
                    row.getCell(2).font = { name: 'Arial', size: 11 };
                    row.getCell(2).alignment = { vertical: 'middle' };

                    // Estilo a la celda del estado
                    const statusCell = row.getCell(3);
                    statusCell.font = { name: 'Arial', size: 10, bold: true };
                    statusCell.alignment = { vertical: 'middle', horizontal: 'center' };

                    if (song.rehearsed) {
                        statusCell.font.color = { argb: 'FF047857' }; // Verde oscuro (texto)
                        statusCell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFD1FAE5' } // Verde clarito (fondo)
                        };
                    } else {
                        statusCell.font.color = { argb: 'FFB91C1C' }; // Rojo oscuro (texto)
                        statusCell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFEE2E2' } // Rojo clarito (fondo)
                        };
                    }
                });

                // Añadir bordes a todas las celdas
                worksheet.eachRow((row) => {
                    row.eachCell((cell) => {
                        cell.border = {
                            top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
                            left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
                            bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
                            right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
                        };
                    });
                });

                // Generar archivo y descargarlo
                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", "Repertorio_Musical.xlsx");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
            } catch (error) {
                console.error('Error generando Excel:', error);
                alert("Hubo un error al generar el archivo Excel.");
            } finally {
                // Restaurar botón
                exportExcelBtn.innerHTML = originalText;
                exportExcelBtn.disabled = false;
            }
        });
    }

    // Lógica para importar desde Excel
    const importExcelBtn = document.getElementById('import-excel-btn');
    const importExcelInput = document.getElementById('import-excel-input');

    if (importExcelBtn && importExcelInput) {
        importExcelBtn.addEventListener('click', () => {
            importExcelInput.click();
        });

        importExcelInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const originalText = importExcelBtn.innerHTML;
            importExcelBtn.innerHTML = 'Importando...';
            importExcelBtn.disabled = true;

            try {
                const reader = new FileReader();
                
                reader.onload = async (event) => {
                    const data = event.target.result;
                    const workbook = new ExcelJS.Workbook();
                    await workbook.xlsx.load(data);
                    
                    const worksheet = workbook.getWorksheet(1); // Tomar la primera hoja
                    const importedSongs = [];

                    worksheet.eachRow((row, rowNumber) => {
                        // Saltar la fila de cabecera
                        if (rowNumber === 1) return;

                        const val1 = row.getCell(1).value;
                        const val2 = row.getCell(2).value;
                        const val3 = row.getCell(3).value;

                        let nameCell = val2;
                        let statusCell = val3;

                        // Soporte para archivos de Excel exportados sin la columna Nº
                        if (val2 === 'YA ENSAYADA' || val2 === 'NO ENSAYADA') {
                            nameCell = val1;
                            statusCell = val2;
                        }

                        if (nameCell) {
                            importedSongs.push({
                                id: Date.now() + rowNumber, // ID único
                                name: nameCell.toString().trim(),
                                rehearsed: statusCell === 'YA ENSAYADA'
                            });
                        }
                    });

                    if (importedSongs.length > 0) {
                        // Combinar canciones existentes con las importadas o simplemente reemplazar
                        // En este caso, reemplazaremos para que sea una importación limpia,
                        // puedes cambiar esto si quieres que se añadan (songs.concat(importedSongs))
                        if(confirm(`Se encontraron ${importedSongs.length} canciones en el Excel. ¿Deseas reemplazar tu repertorio actual por este? (Si cancelas, se añadirán a tu lista actual)`)) {
                            songs = importedSongs;
                        } else {
                            songs = [...songs, ...importedSongs];
                        }
                        
                        saveSongs();
                        alert("¡Repertorio importado con éxito!");
                    } else {
                        alert("No se encontraron canciones válidas en el archivo Excel.");
                    }
                    
                    // Resetear el input file por si quiere importar el mismo archivo otra vez
                    importExcelInput.value = '';
                };
                
                reader.readAsArrayBuffer(file);
                
            } catch (error) {
                console.error('Error importando Excel:', error);
                alert("Hubo un error al leer el archivo Excel.");
            } finally {
                importExcelBtn.innerHTML = originalText;
                importExcelBtn.disabled = false;
            }
        });
    }
});
