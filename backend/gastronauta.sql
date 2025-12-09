-- ================================
-- TABELA USUÁRIOS
-- ================================
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_usuario VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,

  nome_completo VARCHAR(100),
  bio TEXT,
  foto_perfil_url VARCHAR(255),

  reset_token VARCHAR(255),
  reset_token_expira DATETIME,

  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- TABELA RECEITAS
-- ================================
CREATE TABLE receitas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  prato VARCHAR(255) NOT NULL,
  ingredientes TEXT NOT NULL,
  preparacao TEXT NOT NULL,
  descricao TEXT,
  tempo_preparo VARCHAR(50),
  dificuldade VARCHAR(50),
  custo VARCHAR(50),
  rendimento VARCHAR(50),
  cozimento VARCHAR(50),
  url_imagem VARCHAR(255),
  data_postagem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ================================
-- TABELA CURTIDAS (likes de receitas)
-- ================================
CREATE TABLE curtidas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  receita_id INT NOT NULL,
  data_curtida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_like (usuario_id, receita_id),

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE
);

-- ================================
-- TABELA COMENTÁRIOS DAS RECEITAS
-- ================================
CREATE TABLE comentarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receita_id INT NOT NULL,
  usuario_id INT NOT NULL,
  texto TEXT NOT NULL,
  data_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ================================
-- TABELA REAÇÕES EM COMENTÁRIOS (like/dislike)
-- ================================
CREATE TABLE comentario_reacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  comentario_id INT NOT NULL,
  usuario_id INT NOT NULL,
  tipo ENUM('like','dislike') NOT NULL,

  UNIQUE KEY unique_reacao (comentario_id, usuario_id),

  FOREIGN KEY (comentario_id) REFERENCES comentarios(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ================================
-- TABELA AVALIAÇÕES DE RECEITAS
-- ================================
CREATE TABLE avaliacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receita_id INT NOT NULL,
  usuario_id INT NOT NULL,
  nota FLOAT NOT NULL,
  comentario TEXT,
  data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_avaliacao (receita_id, usuario_id),

  FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ================================
-- SISTEMA DE FOLLOW
-- ================================
CREATE TABLE seguidores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seguidor_id INT NOT NULL,
  seguido_id INT NOT NULL,

  UNIQUE KEY unique_follow (seguidor_id, seguido_id),

  FOREIGN KEY (seguidor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (seguido_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
CREATE TABLE avaliacao_respostas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  avaliacao_id INT NOT NULL,
  usuario_id INT NOT NULL,
  texto TEXT NOT NULL,
  data_resposta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
CREATE TABLE avaliacao_reacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  avaliacao_id INT NOT NULL,
  usuario_id INT NOT NULL,
  tipo ENUM('like','dislike') NOT NULL,

  UNIQUE KEY unique_avaliacao_reacao (avaliacao_id, usuario_id),

  FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  exclusivo TINYINT(1) NOT NULL DEFAULT 0
);
CREATE TABLE receita_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receita_id INT NOT NULL,
  tag_id INT NOT NULL,
  FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

INSERT INTO tags (id, nome, exclusivo) VALUES
(1, 'Entrada', 1),
(2, 'Aperitivo', 1),
(3, 'Petisco', 1),
(4, 'Prato Principal', 1),
(5, 'Acompanhamento', 1),
(6, 'Sobremesa', 1),
(7, 'Lanche', 1),
(8, 'Café da manhã', 1),
(9, 'Brunch', 1),
(10, 'Jantar', 1),
(11, 'Ceia', 1),
(12, 'Salgado', 1),
(13, 'Doce', 1),
(14, 'Bebida', 1),
(15, 'Molho', 1),
(16, 'Caldo', 1),
(17, 'Sopa', 1),
(18, 'Salada', 1),
(19, 'Pasta / Creme', 1),
(20, 'Massa', 1),
(21, 'Risoto', 1),
(22, 'Sanduíche', 1),
(23, 'Torta', 1),
(24, 'Pizza', 1),
(25, 'Hambúrguer', 1),
(26, 'Sushi', 1),
(27, 'Wrap', 1),
(28, 'Panqueca', 1),
(29, 'Omelete', 1),
(30, 'Geleia', 1);

INSERT INTO tags (id, nome, exclusivo) VALUES
(100, 'Assado', 0),
(101, 'Grelhado', 0),
(102, 'Frito', 0),
(103, 'Frito por imersão', 0),
(104, 'Airfryer', 0),
(105, 'Cozido', 0),
(106, 'Cozido no vapor', 0),
(107, 'Salteado', 0),
(108, 'Braseado', 0),
(109, 'Selado', 0),
(110, 'Defumado', 0),
(111, 'Marinado', 0),
(112, 'Fermentado', 0),
(113, 'Cru', 0),
(114, 'Sous-vide', 0),
(115, 'Churrasco', 0),
(116, 'Grelha', 0),
(117, 'Forno elétrico', 0),
(118, 'Forno a gás', 0),
(119, 'Micro-ondas', 0),
(120, 'Banho-maria', 0),
(121, 'Desidratado', 0),
(122, 'Flambado', 0),
(123, 'Caramelizado', 0),
(124, 'Empanado', 0),
(125, 'Recheado', 0),
(126, 'Gratinar', 0),
(127, 'Amassar', 0),
(128, 'Sovar', 0),
(129, 'Bater na batedeira', 0),
(130, 'Blender / Mixer', 0),
(131, 'Ferver', 0),
(132, 'Reduzir', 0),
(133, 'Refogar', 0);

INSERT INTO tags (id, nome, exclusivo) VALUES
(200, 'Vegano', 0),
(201, 'Vegetariano', 0),
(202, 'Low Carb', 0),
(203, 'Sem lactose', 0),
(204, 'Sem glúten', 0),
(205, 'Paleo', 0),
(206, 'Keto', 0),
(207, 'Halal', 0),
(208, 'Kosher', 0),
(209, 'Fit / Saudável', 0),
(210, 'Diet', 0),
(211, 'High Protein', 0),
(212, 'Zero açúcar', 0);

INSERT INTO tags (id, nome, exclusivo) VALUES
(300, 'Airfryer', 0),
(301, 'Panela comum', 0),
(302, 'Panela de pressão', 0),
(303, 'Forno', 0),
(304, 'Liquidificador', 0),
(305, 'Batedeira', 0),
(306, 'Mixer', 0),
(307, 'Churrasqueira', 0),
(308, 'Frigideira', 0),
(309, 'Forma', 0),
(310, 'Processador de alimentos', 0),
(311, 'Assadeira', 0),
(312, 'Panela elétrica', 0),
(313, 'Fogão', 0),
(314, 'Wok', 0);

INSERT INTO tags (id, nome, exclusivo) VALUES
(400, 'Apimentado', 0),
(401, 'Suave', 0),
(402, 'Doce', 0),
(403, 'Salgado', 0),
(404, 'Agridoce', 0),
(405, 'Amargo', 0),
(406, 'Azedo', 0),
(407, 'Cítrico', 0),
(408, 'Defumado', 0),
(409, 'Crocante', 0),
(410, 'Cremoso', 0);
