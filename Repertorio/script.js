document.addEventListener('DOMContentLoaded', () => {
    const songForm = document.getElementById('song-form');
    const songNameInput = document.getElementById('song-name');
    const songStatusInput = document.getElementById('song-status');
    const songListContainer = document.getElementById('song-list');

    // Cargar desde LocalStorage o inicializar vacío
    let songs = JSON.parse(localStorage.getItem('repertorio_canciones')) || [];

    // Guardar en Storage local
    const saveSongs = () => {
        localStorage.setItem('repertorio_canciones', JSON.stringify(songs));
    };

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

    // Render inicial
    renderSongs();

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
                songs.forEach(song => {
                    const row = worksheet.addRow({
                        name: song.name,
                        status: song.rehearsed ? 'YA ENSAYADA' : 'NO ENSAYADA'
                    });

                    // Estilo a la celda del nombre
                    row.getCell(1).font = { name: 'Arial', size: 11 };
                    row.getCell(1).alignment = { vertical: 'middle' };

                    // Estilo a la celda del estado
                    const statusCell = row.getCell(2);
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
});
