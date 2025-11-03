from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime
import uuid
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Permite CORS para comunicação com o frontend

# Configuração de ambiente
PORT = int(os.environ.get('PORT', 8000))
BASE_URL = os.environ.get('BASE_URL', '')

# Configuração do banco de dados
DATABASE_URL = "revista.db"

# Configuração para upload de imagens
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

# Criar pasta de uploads se não existir
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def init_db():
    """Inicializa o banco de dados SQLite"""
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS artigos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            conteudo TEXT NOT NULL,
            autor TEXT NOT NULL,
            imagem_url TEXT,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS equipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            posicao INTEGER NOT NULL,
            jogos INTEGER NOT NULL,
            vitorias INTEGER NOT NULL,
            empates INTEGER NOT NULL,
            derrotas INTEGER NOT NULL,
            gols_pro INTEGER NOT NULL,
            gols_contra INTEGER NOT NULL,
            diferenca_gols INTEGER NOT NULL,
            pontos INTEGER NOT NULL,
            logo_url TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS resultados (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ronda INTEGER NOT NULL,
            time_casa TEXT NOT NULL,
            time_fora TEXT NOT NULL,
            gols_casa INTEGER NOT NULL,
            gols_fora INTEGER NOT NULL,
            data_jogo DATE NOT NULL,
            logo_casa TEXT,
            logo_fora TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            nome TEXT NOT NULL,
            telefone TEXT,
            tipo_usuario TEXT DEFAULT 'user',
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Inserir dados de exemplo se a tabela estiver vazia
    cursor.execute("SELECT COUNT(*) FROM equipes")
    count = cursor.fetchone()[0]
    
    if count == 0:
        equipes_exemplo = [
            (1, "UD Songo", 18, 15, 2, 1, 40, 10, 30, 47),
            (2, "Ferroviário", 18, 8, 6, 4, 15, 9, 6, 30),
            (3, "Black Bulls", 15, 8, 3, 4, 24, 16, 8, 27),
            (4, "Ferroviário Beira", 18, 6, 6, 6, 17, 15, 2, 24),
            (5, "Ferroviário Lichingenda", 18, 6, 6, 6, 17, 15, 2, 24),
            (6, "Costa do Sol", 16, 7, 5, 4, 20, 15, 5, 26),
            (7, "Liga Muçulmana", 16, 7, 4, 5, 18, 16, 2, 25),
            (8, "Desportivo Nampula", 16, 6, 6, 4, 19, 16, 3, 24),
            (9, "Chibuto", 16, 5, 7, 4, 16, 14, 2, 22),
            (10, "Maxaquene", 16, 5, 6, 5, 15, 16, -1, 21),
            (11, "Textáfrica", 16, 4, 8, 4, 14, 15, -1, 20),
            (12, "Palmeiras", 16, 4, 7, 5, 13, 16, -3, 19),
            (13, "Estrela Vermelha", 16, 3, 8, 5, 12, 18, -6, 17),
            (14, "Nacala", 16, 2, 5, 9, 11, 25, -14, 11)
        ]
        
        cursor.executemany("""
            INSERT INTO equipes (posicao, nome, jogos, vitorias, empates, derrotas, gols_pro, gols_contra, diferenca_gols, pontos)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, equipes_exemplo)
    
    # Inserir dados de exemplo de resultados se a tabela estiver vazia
    cursor.execute("SELECT COUNT(*) FROM resultados")
    count_resultados = cursor.fetchone()[0]
    
    if count_resultados == 0:
        resultados_exemplo = [
            (19, "Desportivo Matola", "UD Songo", 0, 4, "2024-10-28"),
            (9, "ENH Vilankulo", "Baia de Pemba", 1, 0, "2024-10-28"),
            (18, "Ferroviario Beira", "Ferroviario Nampula", 2, 1, "2024-10-26"),
            (18, "Costa do Sol", "Desportivo Matola", 2, 1, "2024-10-25"),
            (10, "Baia de Pemba", "UD Songo", 0, 2, "2024-10-24"),
            (18, "Nacala", "Ferroviario Lichinga", 2, 2, "2024-10-24"),
        ]
        
        cursor.executemany("""
            INSERT INTO resultados (ronda, time_casa, time_fora, gols_casa, gols_fora, data_jogo)
            VALUES (?, ?, ?, ?, ?, ?)
        """, resultados_exemplo)
    
    # Inserir usuários de exemplo
    cursor.execute("SELECT COUNT(*) FROM usuarios")
    count_usuarios = cursor.fetchone()[0]
    
    if count_usuarios == 0:
        usuarios_exemplo = [
            ("admin@mozafut.com", "123456", "Administrador", "+258 84 123 4567", "admin"),
            ("user@mozafut.com", "123456", "Usuário", "+258 84 123 4567", "user")
        ]
        
        cursor.executemany("""
            INSERT INTO usuarios (email, senha, nome, telefone, tipo_usuario)
            VALUES (?, ?, ?, ?, ?)
        """, usuarios_exemplo)
    
    conn.commit()
    conn.close()

# Inicializar banco de dados
init_db()

# Rotas da API
@app.route("/", methods=["GET"])
def root():
    return jsonify({"message": "API da Revista funcionando!"})

@app.route("/artigos", methods=["GET"])
def get_artigos():
    """Busca todos os artigos"""
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, titulo, conteudo, autor, imagem_url, data_criacao FROM artigos ORDER BY data_criacao DESC")
    artigos = cursor.fetchall()
    
    conn.close()
    
    artigos_list = []
    for artigo in artigos:
        artigos_list.append({
            "id": artigo[0],
            "titulo": artigo[1],
            "conteudo": artigo[2],
            "autor": artigo[3],
            "imagem_url": artigo[4],
            "data_criacao": artigo[5]
        })
    
    return jsonify(artigos_list)

@app.route("/artigos/<int:artigo_id>", methods=["GET"])
def get_artigo(artigo_id):
    """Busca um artigo específico por ID"""
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, titulo, conteudo, autor, imagem_url, data_criacao FROM artigos WHERE id = ?", (artigo_id,))
    artigo = cursor.fetchone()
    
    conn.close()
    
    if not artigo:
        return jsonify({"error": "Artigo não encontrado"}), 404
    
    return jsonify({
        "id": artigo[0],
        "titulo": artigo[1],
        "conteudo": artigo[2],
        "autor": artigo[3],
        "imagem_url": artigo[4],
        "data_criacao": artigo[5]
    })

@app.route("/artigos", methods=["POST"])
def create_artigo():
    """Cria um novo artigo"""
    data = request.get_json()
    
    if not data or not all(key in data for key in ['titulo', 'conteudo', 'autor']):
        return jsonify({"error": "Dados incompletos"}), 400
    
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute(
        "INSERT INTO artigos (titulo, conteudo, autor, imagem_url) VALUES (?, ?, ?, ?)",
        (data['titulo'], data['conteudo'], data['autor'], data.get('imagem_url'))
    )
    
    artigo_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Buscar o artigo criado
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    cursor.execute("SELECT id, titulo, conteudo, autor, imagem_url, data_criacao FROM artigos WHERE id = ?", (artigo_id,))
    novo_artigo = cursor.fetchone()
    conn.close()
    
    return jsonify({
        "id": novo_artigo[0],
        "titulo": novo_artigo[1],
        "conteudo": novo_artigo[2],
        "autor": novo_artigo[3],
        "imagem_url": novo_artigo[4],
        "data_criacao": novo_artigo[5]
    }), 201

@app.route("/artigos/<int:artigo_id>", methods=["PUT"])
def update_artigo(artigo_id):
    """Atualiza um artigo existente"""
    data = request.get_json()
    
    if not data or not all(key in data for key in ['titulo', 'conteudo', 'autor']):
        return jsonify({"error": "Dados incompletos"}), 400
    
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Verificar se o artigo existe
    cursor.execute("SELECT id FROM artigos WHERE id = ?", (artigo_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Artigo não encontrado"}), 404
    
    cursor.execute(
        "UPDATE artigos SET titulo = ?, conteudo = ?, autor = ? WHERE id = ?",
        (data['titulo'], data['conteudo'], data['autor'], artigo_id)
    )
    
    conn.commit()
    conn.close()
    
    # Buscar o artigo atualizado
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    cursor.execute("SELECT id, titulo, conteudo, autor, data_criacao FROM artigos WHERE id = ?", (artigo_id,))
    artigo_atualizado = cursor.fetchone()
    conn.close()
    
    return jsonify({
        "id": artigo_atualizado[0],
        "titulo": artigo_atualizado[1],
        "conteudo": artigo_atualizado[2],
        "autor": artigo_atualizado[3],
        "data_criacao": artigo_atualizado[4]
    })

@app.route("/artigos/<int:artigo_id>", methods=["DELETE"])
def delete_artigo(artigo_id):
    """Deleta um artigo"""
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Verificar se o artigo existe
    cursor.execute("SELECT id FROM artigos WHERE id = ?", (artigo_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Artigo não encontrado"}), 404
    
    cursor.execute("DELETE FROM artigos WHERE id = ?", (artigo_id,))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Artigo deletado com sucesso"})

@app.route("/upload", methods=["POST"])
def upload_file():
    """Upload de imagem"""
    if 'file' not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "Nenhum arquivo selecionado"}), 400
    
    if file and allowed_file(file.filename):
        # Gerar nome único para o arquivo
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        
        # Salvar arquivo
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # Retornar URL da imagem
        # Usa BASE_URL se estiver definido (deploy), caso contrário usa o request.host
        if BASE_URL:
            image_url = f"{BASE_URL}/uploads/{unique_filename}"
        else:
            # Para desenvolvimento local, usa o host da requisição
            scheme = request.scheme
            host = request.host
            image_url = f"{scheme}://{host}/uploads/{unique_filename}"
        return jsonify({"image_url": image_url}), 200
    
    return jsonify({"error": "Tipo de arquivo não permitido"}), 400

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    """Servir arquivos de upload"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route("/equipes", methods=["GET"])
def get_equipes():
    """Busca todas as equipes da classificação"""
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, posicao, nome, jogos, vitorias, empates, derrotas, gols_pro, gols_contra, diferenca_gols, pontos, logo_url
        FROM equipes 
        ORDER BY posicao ASC
    """)
    equipes = cursor.fetchall()
    
    conn.close()
    
    equipes_list = []
    for equipe in equipes:
        equipes_list.append({
            "id": equipe[0],
            "posicao": equipe[1],
            "nome": equipe[2],
            "jogos": equipe[3],
            "vitorias": equipe[4],
            "empates": equipe[5],
            "derrotas": equipe[6],
            "gols_pro": equipe[7],
            "gols_contra": equipe[8],
            "diferenca_gols": equipe[9],
            "pontos": equipe[10],
            "logo_url": equipe[11]
        })
    
    return jsonify(equipes_list)

@app.route("/equipes", methods=["POST"])
def create_equipe():
    """Cria uma nova equipe"""
    data = request.get_json()
    
    if not data or not all(key in data for key in ['nome', 'posicao', 'jogos', 'vitorias', 'empates', 'derrotas', 'gols_pro', 'gols_contra']):
        return jsonify({"error": "Dados incompletos"}), 400
    
    # Calcular diferença de gols e pontos
    diferenca_gols = data['gols_pro'] - data['gols_contra']
    pontos = (data['vitorias'] * 3) + (data['empates'] * 1)
    
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO equipes (nome, posicao, jogos, vitorias, empates, derrotas, gols_pro, gols_contra, diferenca_gols, pontos, logo_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data['nome'], 
        data['posicao'], 
        data['jogos'], 
        data['vitorias'], 
        data['empates'], 
        data['derrotas'], 
        data['gols_pro'], 
        data['gols_contra'], 
        diferenca_gols, 
        pontos,
        data.get('logo_url')
    ))
    
    equipe_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Equipe criada com sucesso", "id": equipe_id}), 201

@app.route("/equipes/<int:equipe_id>", methods=["PUT"])
def update_equipe(equipe_id):
    """Atualiza uma equipe existente"""
    data = request.get_json()
    
    if not data or not all(key in data for key in ['nome', 'posicao', 'jogos', 'vitorias', 'empates', 'derrotas', 'gols_pro', 'gols_contra']):
        return jsonify({"error": "Dados incompletos"}), 400
    
    # Calcular diferença de gols e pontos
    diferenca_gols = data['gols_pro'] - data['gols_contra']
    pontos = (data['vitorias'] * 3) + (data['empates'] * 1)
    
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Verificar se a equipe existe
    cursor.execute("SELECT id FROM equipes WHERE id = ?", (equipe_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Equipe não encontrada"}), 404
    
    cursor.execute("""
        UPDATE equipes 
        SET nome = ?, posicao = ?, jogos = ?, vitorias = ?, empates = ?, derrotas = ?, 
            gols_pro = ?, gols_contra = ?, diferenca_gols = ?, pontos = ?, logo_url = ?
        WHERE id = ?
    """, (
        data['nome'], 
        data['posicao'], 
        data['jogos'], 
        data['vitorias'], 
        data['empates'], 
        data['derrotas'], 
        data['gols_pro'], 
        data['gols_contra'], 
        diferenca_gols, 
        pontos,
        data.get('logo_url'),
        equipe_id
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Equipe atualizada com sucesso"})

@app.route("/equipes/<int:equipe_id>", methods=["DELETE"])
def delete_equipe(equipe_id):
    """Deleta uma equipe"""
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Verificar se a equipe existe
    cursor.execute("SELECT id FROM equipes WHERE id = ?", (equipe_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Equipe não encontrada"}), 404
    
    cursor.execute("DELETE FROM equipes WHERE id = ?", (equipe_id,))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Equipe deletada com sucesso"})

@app.route("/resultados", methods=["GET"])
def get_resultados():
    """Busca todos os resultados dos jogos"""
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, ronda, time_casa, time_fora, gols_casa, gols_fora, data_jogo, logo_casa, logo_fora
        FROM resultados 
        ORDER BY ronda DESC, data_jogo DESC
    """)
    resultados = cursor.fetchall()
    
    conn.close()
    
    resultados_list = []
    for resultado in resultados:
        resultados_list.append({
            "id": resultado[0],
            "ronda": resultado[1],
            "time_casa": resultado[2],
            "time_fora": resultado[3],
            "gols_casa": resultado[4],
            "gols_fora": resultado[5],
            "data_jogo": resultado[6],
            "logo_casa": resultado[7],
            "logo_fora": resultado[8]
        })
    
    return jsonify(resultados_list)

@app.route("/resultados", methods=["POST"])
def create_resultado():
    """Cria um novo resultado"""
    data = request.get_json()
    
    if not data or not all(key in data for key in ['ronda', 'time_casa', 'time_fora', 'gols_casa', 'gols_fora', 'data_jogo']):
        return jsonify({"error": "Dados incompletos"}), 400
    
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO resultados (ronda, time_casa, time_fora, gols_casa, gols_fora, data_jogo, logo_casa, logo_fora)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data['ronda'],
        data['time_casa'],
        data['time_fora'],
        data['gols_casa'],
        data['gols_fora'],
        data['data_jogo'],
        data.get('logo_casa'),
        data.get('logo_fora')
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Resultado criado com sucesso"}), 201

@app.route("/resultados/<int:resultado_id>", methods=["PUT"])
def update_resultado(resultado_id):
    """Atualiza um resultado existente"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Dados não fornecidos"}), 400
    
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE resultados 
        SET ronda = ?, time_casa = ?, time_fora = ?, gols_casa = ?, gols_fora = ?, 
            data_jogo = ?, logo_casa = ?, logo_fora = ?
        WHERE id = ?
    """, (
        data.get('ronda'),
        data.get('time_casa'),
        data.get('time_fora'),
        data.get('gols_casa'),
        data.get('gols_fora'),
        data.get('data_jogo'),
        data.get('logo_casa'),
        data.get('logo_fora'),
        resultado_id
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Resultado atualizado com sucesso"})

@app.route("/resultados/<int:resultado_id>", methods=["DELETE"])
def delete_resultado(resultado_id):
    """Deleta um resultado"""
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM resultados WHERE id = ?", (resultado_id,))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Resultado deletado com sucesso"})

# Endpoints de autenticação
@app.route("/auth/login", methods=["POST"])
def login():
    """Autentica um usuário"""
    data = request.get_json()
    email = data.get('email')
    senha = data.get('password')
    
    if not email or not senha:
        return jsonify({"error": "Email e senha são obrigatórios"}), 400
    
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, email, nome, telefone, tipo_usuario 
        FROM usuarios 
        WHERE email = ? AND senha = ?
    """, (email, senha))
    
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return jsonify({
            "success": True,
            "user": {
                "id": user[0],
                "email": user[1],
                "name": user[2],
                "phone": user[3],
                "userType": user[4]
            }
        })
    else:
        return jsonify({"error": "Credenciais inválidas"}), 401

@app.route("/auth/register", methods=["POST"])
def register():
    """Registra um novo usuário"""
    data = request.get_json()
    email = data.get('email')
    senha = data.get('password')
    nome = data.get('name')
    telefone = data.get('phone')
    
    if not email or not senha or not nome:
        return jsonify({"error": "Email, senha e nome são obrigatórios"}), 400
    
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Verificar se email já existe
    cursor.execute("SELECT id FROM usuarios WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "Email já cadastrado"}), 400
    
    # Inserir novo usuário
    cursor.execute("""
        INSERT INTO usuarios (email, senha, nome, telefone, tipo_usuario)
        VALUES (?, ?, ?, ?, 'user')
    """, (email, senha, nome, telefone))
    
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "message": "Usuário cadastrado com sucesso"})

@app.route("/auth/profile", methods=["PUT"])
def update_profile():
    """Atualiza perfil do usuário"""
    data = request.get_json()
    user_id = data.get('id')
    nome = data.get('name')
    email = data.get('email')
    telefone = data.get('phone')
    
    if not user_id:
        return jsonify({"error": "ID do usuário é obrigatório"}), 400
    
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE usuarios 
        SET nome = ?, email = ?, telefone = ?
        WHERE id = ?
    """, (nome, email, telefone, user_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "message": "Perfil atualizado com sucesso"})

if __name__ == "__main__":
    # Em produção, debug deve ser False
    debug_mode = os.environ.get('FLASK_ENV') == 'development' or os.environ.get('DEBUG') == 'True'
    app.run(host="0.0.0.0", port=PORT, debug=debug_mode)
