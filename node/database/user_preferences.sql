-- Tabla para almacenar preferencias de usuario por entidad (clients, employees, etc.)
CREATE TABLE IF NOT EXISTS user_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  entity VARCHAR(50) NOT NULL COMMENT 'Nombre de la lista/tabla (clients, employees, services, etc.)',
  preferences JSON NOT NULL DEFAULT ('{}') COMMENT 'Preferencias de ordenación y filtros',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_entity (user_id, entity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
