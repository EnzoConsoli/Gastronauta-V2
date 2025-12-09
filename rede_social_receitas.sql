-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           12.1.2-MariaDB - MariaDB Server
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.13.0.7163
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para rede_social_receitas
CREATE DATABASE IF NOT EXISTS `rede_social_receitas` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `rede_social_receitas`;

-- Copiando estrutura para tabela rede_social_receitas.avaliacao_reacoes
CREATE TABLE IF NOT EXISTS `avaliacao_reacoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `avaliacao_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `tipo` enum('like','dislike') NOT NULL,
  `data_reacao` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_reacao` (`avaliacao_id`,`usuario_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `1` FOREIGN KEY (`avaliacao_id`) REFERENCES `avaliacoes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela rede_social_receitas.avaliacao_reacoes: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela rede_social_receitas.avaliacao_respostas
CREATE TABLE IF NOT EXISTS `avaliacao_respostas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `avaliacao_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `texto` text NOT NULL,
  `data_resposta` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `avaliacao_id` (`avaliacao_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `1` FOREIGN KEY (`avaliacao_id`) REFERENCES `avaliacoes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela rede_social_receitas.avaliacao_respostas: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela rede_social_receitas.avaliacoes
CREATE TABLE IF NOT EXISTS `avaliacoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `receita_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `nota` float NOT NULL,
  `comentario` text DEFAULT NULL,
  `data_avaliacao` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_avaliacao` (`receita_id`,`usuario_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `1` FOREIGN KEY (`receita_id`) REFERENCES `receitas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela rede_social_receitas.avaliacoes: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela rede_social_receitas.comentario_reacoes
CREATE TABLE IF NOT EXISTS `comentario_reacoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `comentario_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `tipo` enum('like','dislike') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_reacao` (`comentario_id`,`usuario_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `1` FOREIGN KEY (`comentario_id`) REFERENCES `comentarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela rede_social_receitas.comentario_reacoes: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela rede_social_receitas.comentarios
CREATE TABLE IF NOT EXISTS `comentarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `receita_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `texto` text NOT NULL,
  `data_comentario` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `receita_id` (`receita_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `1` FOREIGN KEY (`receita_id`) REFERENCES `receitas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela rede_social_receitas.comentarios: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela rede_social_receitas.curtidas
CREATE TABLE IF NOT EXISTS `curtidas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `receita_id` int(11) NOT NULL,
  `data_curtida` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_like` (`usuario_id`,`receita_id`),
  KEY `receita_id` (`receita_id`),
  CONSTRAINT `1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`receita_id`) REFERENCES `receitas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela rede_social_receitas.curtidas: ~3 rows (aproximadamente)
INSERT INTO `curtidas` (`id`, `usuario_id`, `receita_id`, `data_curtida`) VALUES
	(2, 3, 1, '2025-12-07 21:37:12'),
	(4, 1, 1, '2025-12-08 14:10:19'),
	(6, 1, 2, '2025-12-08 15:17:43');

-- Copiando estrutura para tabela rede_social_receitas.receita_tags
CREATE TABLE IF NOT EXISTS `receita_tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `receita_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `receita_id` (`receita_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `1` FOREIGN KEY (`receita_id`) REFERENCES `receitas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela rede_social_receitas.receita_tags: ~4 rows (aproximadamente)
INSERT INTO `receita_tags` (`id`, `receita_id`, `tag_id`) VALUES
	(25, 1, 2),
	(26, 1, 120),
	(27, 1, 202),
	(28, 1, 402),
	(29, 1, 208),
	(30, 1, 201),
	(31, 1, 112),
	(32, 1, 118),
	(33, 1, 123),
	(34, 1, 129),
	(97, 7, 4),
	(98, 7, 103),
	(99, 7, 115),
	(100, 7, 108),
	(101, 7, 202),
	(102, 7, 209),
	(103, 7, 211),
	(104, 7, 204),
	(105, 7, 133),
	(106, 7, 403),
	(107, 7, 408);

-- Copiando estrutura para tabela rede_social_receitas.receitas
CREATE TABLE IF NOT EXISTS `receitas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `prato` varchar(255) NOT NULL,
  `ingredientes` text NOT NULL,
  `preparacao` text NOT NULL,
  `descricao` text DEFAULT NULL,
  `tempo_preparo` varchar(50) DEFAULT NULL,
  `dificuldade` varchar(50) DEFAULT NULL,
  `custo` varchar(50) DEFAULT NULL,
  `rendimento` varchar(50) DEFAULT NULL,
  `cozimento` varchar(50) DEFAULT NULL,
  `url_imagem` varchar(255) DEFAULT NULL,
  `data_postagem` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela rede_social_receitas.receitas: ~2 rows (aproximadamente)
INSERT INTO `receitas` (`id`, `usuario_id`, `prato`, `ingredientes`, `preparacao`, `descricao`, `tempo_preparo`, `dificuldade`, `custo`, `rendimento`, `cozimento`, `url_imagem`, `data_postagem`) VALUES
	(1, 1, 'fogo', '1', '1', '5', '3', 'Fácil', 'Médio', '3', '3', '/uploads/1765127695199-fogueira.png', '2025-12-07 17:14:55'),
	(2, 3, 'agya', '1', '1', '12', '1', 'Fácil', 'Médio', '1', '2', '/uploads/1765143415629-Capturar.PNG', '2025-12-07 21:36:55'),
	(7, 1, 'fogs', '1', '1', '123', '1', 'Médio', 'Médio', '1', '1', '/uploads/1765312002214-stars.png', '2025-12-09 20:26:42');

-- Copiando estrutura para tabela rede_social_receitas.seguidores
CREATE TABLE IF NOT EXISTS `seguidores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `seguidor_id` int(11) NOT NULL,
  `seguido_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_follow` (`seguidor_id`,`seguido_id`),
  KEY `seguido_id` (`seguido_id`),
  CONSTRAINT `1` FOREIGN KEY (`seguidor_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`seguido_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela rede_social_receitas.seguidores: ~2 rows (aproximadamente)
INSERT INTO `seguidores` (`id`, `seguidor_id`, `seguido_id`) VALUES
	(1, 3, 1),
	(4, 1, 3);

-- Copiando estrutura para tabela rede_social_receitas.tags
CREATE TABLE IF NOT EXISTS `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `exclusivo` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=411 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela rede_social_receitas.tags: ~103 rows (aproximadamente)
INSERT INTO `tags` (`id`, `nome`, `exclusivo`) VALUES
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
	(30, 'Geleia', 1),
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
	(133, 'Refogar', 0),
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
	(212, 'Zero açúcar', 0),
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
	(314, 'Wok', 0),
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

-- Copiando estrutura para tabela rede_social_receitas.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome_usuario` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `nome_completo` varchar(100) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `foto_perfil_url` varchar(255) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expira` datetime DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome_usuario` (`nome_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela rede_social_receitas.usuarios: ~1 rows (aproximadamente)
INSERT INTO `usuarios` (`id`, `nome_usuario`, `email`, `senha_hash`, `nome_completo`, `bio`, `foto_perfil_url`, `reset_token`, `reset_token_expira`, `criado_em`) VALUES
	(1, 'Enzo Consoli', 'enzoconsoli2007@gmail.com', '$2b$10$ZZutLW3VFKTjUMGN3ONXGuiv0vpd6B8GipMvhhWBEvd9RgOnn62wq', NULL, NULL, '/api/users/avatars/1765127732727-image.png', NULL, NULL, '2025-12-07 17:13:22'),
	(3, 'Enzo', 'zogamer2019@gmail.com', '$2b$10$Ga/YPGZiQz5lIeHqPvyYZOYVuB0VsAcpvsXGkEXvxY1vxMsw1Zkgi', NULL, NULL, '/api/users/avatars/1765143389883-MTA_ San Andreas 03_03_2024 21_13_15.png', NULL, NULL, '2025-12-07 21:35:12');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
