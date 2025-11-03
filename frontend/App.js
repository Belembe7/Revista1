import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  SafeAreaView,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import axios from 'axios';

// Configuração da API - ajuste o IP conforme necessário
const API_BASE_URL = 'http://10.197.232.123:8000'; // IP da sua máquina na rede

export default function App() {
  const [artigos, setArtigos] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [autor, setAutor] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Notícias');
  const [showForm, setShowForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [classificacaoFilter, setClassificacaoFilter] = useState('TOTAL');
  const [showEquipeForm, setShowEquipeForm] = useState(false);
  const [editingEquipe, setEditingEquipe] = useState(null);
  const [equipeForm, setEquipeForm] = useState({
    nome: '',
    posicao: '',
    jogos: '',
    vitorias: '',
    empates: '',
    derrotas: '',
    gols_pro: '',
    gols_contra: '',
    logo_url: ''
  });
  const [showResultadoForm, setShowResultadoForm] = useState(false);
  const [editingResultado, setEditingResultado] = useState(null);
  const [resultadoForm, setResultadoForm] = useState({
    ronda: '',
    time_casa: '',
    time_fora: '',
    gols_casa: '',
    gols_fora: '',
    data_jogo: '',
    logo_casa: '',
    logo_fora: ''
  });
  const [activeNavItem, setActiveNavItem] = useState('Partidas');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArtigos, setFilteredArtigos] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [userType, setUserType] = useState(''); // 'admin' ou 'user'
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loginError, setLoginError] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [registeredUsers, setRegisteredUsers] = useState([
    { email: 'admin@mozafut.com', password: '123456', userType: 'admin', name: 'Administrador', phone: '+258 84 123 4567' },
    { email: 'user@mozafut.com', password: '123456', userType: 'user', name: 'Usuário', phone: '+258 84 123 4567' }
  ]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedArtigo, setSelectedArtigo] = useState(null);
  const [showArtigoDetail, setShowArtigoDetail] = useState(false);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  
  const scrollViewRef = useRef(null);
  const artigoCardRefs = useRef({});


  // Buscar artigos ao carregar o app
  useEffect(() => {
    fetchArtigos();
    fetchEquipes();
    fetchResultados();
  }, []);

  // Carrossel automático de notícias (muda a cada 5 segundos)
  useEffect(() => {
    if (artigos.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentCarouselIndex((prevIndex) => (prevIndex + 1) % artigos.length);
    }, 5000); // 5 segundos

    return () => clearInterval(interval);
  }, [artigos.length]);

  const fetchArtigos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/artigos`);
      setArtigos(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar artigos:', error);
      setArtigos([]); // Garantir que artigos seja sempre um array
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/equipes`);
      setEquipes(response.data);
    } catch (error) {
      console.error('Erro ao buscar equipes:', error);
    }
  };

  const fetchResultados = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/resultados`);
      setResultados(response.data);
    } catch (error) {
      console.error('Erro ao buscar resultados:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setIsSearching(query.length > 0);
    
    if (query.length === 0) {
      setFilteredArtigos([]);
      return;
    }
    
    const filtered = artigos.filter(artigo => 
      artigo.titulo.toLowerCase().includes(query.toLowerCase()) ||
      artigo.conteudo.toLowerCase().includes(query.toLowerCase()) ||
      artigo.autor.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredArtigos(filtered);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredArtigos([]);
    setIsSearching(false);
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    // Limpar pesquisa quando sair da aba de pesquisa
    if (tabName !== 'Pesquisa') {
      clearSearch();
    }
  };

  const handleLogin = async () => {
    setLoginError('');
    
    // Validação básica
    if (!loginForm.email || !loginForm.password) {
      setLoginError('Preencha todos os campos');
      return;
    }

    // Limpar espaços em branco
    const email = loginForm.email.trim();
    const password = loginForm.password.trim();

    if (!email || !password) {
      setLoginError('Preencha todos os campos');
      return;
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLoginError('Digite um email válido');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: email,
        password: password
      });
      
      if (response.data && response.data.success) {
        setIsLoggedIn(true);
        setUserType(response.data.user.userType);
        setCurrentUser(response.data.user);
        setLoginForm({ email: '', password: '', confirmPassword: '' });
        setLoginError(''); // Limpar qualquer erro anterior
      } else {
        setLoginError('Erro na resposta do servidor');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      
      if (error.response) {
        // Servidor respondeu com erro
        if (error.response.data && error.response.data.error) {
          setLoginError(error.response.data.error);
        } else if (error.response.status === 401) {
          setLoginError('Email ou senha incorretos');
        } else if (error.response.status === 400) {
          setLoginError('Dados inválidos');
        } else {
          setLoginError('Erro do servidor');
        }
      } else if (error.request) {
        // Requisição foi feita mas não houve resposta
        setLoginError('Erro de conexão. Verifique se o backend está rodando.');
      } else {
        // Erro na configuração da requisição
        setLoginError('Erro ao fazer login. Tente novamente.');
      }
    }
  };

  const handleSignup = async () => {
    setLoginError('');
    
    // Validação básica
    if (!loginForm.email || !loginForm.password || !loginForm.confirmPassword) {
      setLoginError('Preencha todos os campos');
      return;
    }

    // Limpar espaços em branco
    const email = loginForm.email.trim();
    const password = loginForm.password.trim();
    const confirmPassword = loginForm.confirmPassword.trim();

    if (!email || !password || !confirmPassword) {
      setLoginError('Preencha todos os campos');
      return;
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLoginError('Digite um email válido');
      return;
    }

    if (password !== confirmPassword) {
      setLoginError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setLoginError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: email,
        password: password,
        name: email.split('@')[0], // Usar parte do email como nome inicial
        phone: '+258 84 000 0000' // Telefone padrão
      });
      
      if (response.data && response.data.success) {
        Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login para continuar.');
        setIsLoginMode(true);
        setLoginForm({ email: '', password: '', confirmPassword: '' });
        setLoginError(''); // Limpar qualquer erro anterior
      } else {
        setLoginError('Erro na resposta do servidor');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      
      if (error.response) {
        // Servidor respondeu com erro
        if (error.response.data && error.response.data.error) {
          setLoginError(error.response.data.error);
        } else if (error.response.status === 400) {
          setLoginError('Dados inválidos');
        } else if (error.response.status === 409) {
          setLoginError('Email já cadastrado');
        } else {
          setLoginError('Erro do servidor');
        }
      } else if (error.request) {
        // Requisição foi feita mas não houve resposta
        setLoginError('Erro de conexão. Verifique se o backend está rodando.');
      } else {
        // Erro na configuração da requisição
        setLoginError('Erro ao criar conta. Tente novamente.');
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType('');
    setCurrentUser(null);
    setLoginForm({ email: '', password: '', confirmPassword: '' });
    setLoginError('');
    setIsLoginMode(true);
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setLoginError('');
    setLoginForm({ email: '', password: '', confirmPassword: '' });
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const handleEditProfile = () => {
    setShowEditProfile(true);
    // Preencher dados atuais do usuário logado
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      });
    }
  };

  const saveProfile = async () => {
    if (currentUser) {
      try {
        const response = await axios.put(`${API_BASE_URL}/auth/profile`, {
          id: currentUser.id,
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone
        });
        
        if (response.data.success) {
          // Atualizar dados do usuário atual
          const updatedUser = {
            ...currentUser,
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone
          };
          
          setCurrentUser(updatedUser);
          Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
          setShowEditProfile(false);
        }
      } catch (error) {
        Alert.alert('Erro', 'Erro ao atualizar perfil. Tente novamente.');
      }
    }
  };

  const cancelEditProfile = () => {
    setShowEditProfile(false);
    setProfileData({ name: '', email: '', phone: '' });
  };

  const createResultado = async () => {
    if (!resultadoForm.ronda || !resultadoForm.time_casa || !resultadoForm.time_fora || 
        !resultadoForm.gols_casa || !resultadoForm.gols_fora || !resultadoForm.data_jogo) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      
      let logoCasa = resultadoForm.logo_casa;
      let logoFora = resultadoForm.logo_fora;
      
      if (selectedImage) {
        logoCasa = await uploadImage(selectedImage.uri);
      }

      await axios.post(`${API_BASE_URL}/resultados`, {
        ronda: parseInt(resultadoForm.ronda),
        time_casa: resultadoForm.time_casa.trim(),
        time_fora: resultadoForm.time_fora.trim(),
        gols_casa: parseInt(resultadoForm.gols_casa),
        gols_fora: parseInt(resultadoForm.gols_fora),
        data_jogo: resultadoForm.data_jogo,
        logo_casa: logoCasa,
        logo_fora: logoFora
      });
      
      resetResultadoForm();
      fetchResultados();
      Alert.alert('Sucesso', 'Resultado adicionado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar o resultado');
      console.error('Erro ao criar resultado:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateResultado = async () => {
    if (!editingResultado) return;

    try {
      setLoading(true);
      
      let logoCasa = resultadoForm.logo_casa;
      let logoFora = resultadoForm.logo_fora;
      
      if (selectedImage) {
        logoCasa = await uploadImage(selectedImage.uri);
      }

      await axios.put(`${API_BASE_URL}/resultados/${editingResultado.id}`, {
        ronda: parseInt(resultadoForm.ronda),
        time_casa: resultadoForm.time_casa.trim(),
        time_fora: resultadoForm.time_fora.trim(),
        gols_casa: parseInt(resultadoForm.gols_casa),
        gols_fora: parseInt(resultadoForm.gols_fora),
        data_jogo: resultadoForm.data_jogo,
        logo_casa: logoCasa,
        logo_fora: logoFora
      });
      
      resetResultadoForm();
      fetchResultados();
      Alert.alert('Sucesso', 'Resultado atualizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o resultado');
      console.error('Erro ao atualizar resultado:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteResultado = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/resultados/${id}`);
      fetchResultados();
      Alert.alert('Sucesso', 'Resultado deletado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível deletar o resultado');
      console.error('Erro ao deletar resultado:', error);
    }
  };

  const resetResultadoForm = () => {
    setResultadoForm({
      ronda: '',
      time_casa: '',
      time_fora: '',
      gols_casa: '',
      gols_fora: '',
      data_jogo: '',
      logo_casa: '',
      logo_fora: ''
    });
    setSelectedImage(null);
    setShowResultadoForm(false);
    setEditingResultado(null);
  };

  const editResultado = (resultado) => {
    setResultadoForm({
      ronda: resultado.ronda.toString(),
      time_casa: resultado.time_casa,
      time_fora: resultado.time_fora,
      gols_casa: resultado.gols_casa.toString(),
      gols_fora: resultado.gols_fora.toString(),
      data_jogo: resultado.data_jogo,
      logo_casa: resultado.logo_casa || '',
      logo_fora: resultado.logo_fora || ''
    });
    setEditingResultado(resultado);
    setShowResultadoForm(true);
  };

  const createEquipe = async () => {
    if (!equipeForm.nome.trim() || !equipeForm.posicao || !equipeForm.jogos || 
        !equipeForm.vitorias || !equipeForm.empates || !equipeForm.derrotas || 
        !equipeForm.gols_pro || !equipeForm.gols_contra) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      
      let logoUrl = equipeForm.logo_url;
      if (selectedImage) {
        logoUrl = await uploadImage(selectedImage.uri);
      }

      await axios.post(`${API_BASE_URL}/equipes`, {
        nome: equipeForm.nome.trim(),
        posicao: parseInt(equipeForm.posicao),
        jogos: parseInt(equipeForm.jogos),
        vitorias: parseInt(equipeForm.vitorias),
        empates: parseInt(equipeForm.empates),
        derrotas: parseInt(equipeForm.derrotas),
        gols_pro: parseInt(equipeForm.gols_pro),
        gols_contra: parseInt(equipeForm.gols_contra),
        logo_url: logoUrl
      });
      
      resetEquipeForm();
      fetchEquipes();
      Alert.alert('Sucesso', 'Equipe adicionada com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar a equipe');
      console.error('Erro ao criar equipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEquipe = async () => {
    if (!editingEquipe) return;

    try {
      setLoading(true);
      
      let logoUrl = equipeForm.logo_url;
      if (selectedImage) {
        logoUrl = await uploadImage(selectedImage.uri);
      }

      await axios.put(`${API_BASE_URL}/equipes/${editingEquipe.id}`, {
        nome: equipeForm.nome.trim(),
        posicao: parseInt(equipeForm.posicao),
        jogos: parseInt(equipeForm.jogos),
        vitorias: parseInt(equipeForm.vitorias),
        empates: parseInt(equipeForm.empates),
        derrotas: parseInt(equipeForm.derrotas),
        gols_pro: parseInt(equipeForm.gols_pro),
        gols_contra: parseInt(equipeForm.gols_contra),
        logo_url: logoUrl
      });
      
      resetEquipeForm();
      fetchEquipes();
      Alert.alert('Sucesso', 'Equipe atualizada com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a equipe');
      console.error('Erro ao atualizar equipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteEquipe = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/equipes/${id}`);
      fetchEquipes();
      Alert.alert('Sucesso', 'Equipe deletada com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível deletar a equipe');
      console.error('Erro ao deletar equipe:', error);
    }
  };

  const resetEquipeForm = () => {
    setEquipeForm({
      nome: '',
      posicao: '',
      jogos: '',
      vitorias: '',
      empates: '',
      derrotas: '',
      gols_pro: '',
      gols_contra: '',
      logo_url: ''
    });
    setSelectedImage(null);
    setShowEquipeForm(false);
    setEditingEquipe(null);
  };

  const editEquipe = (equipe) => {
    setEquipeForm({
      nome: equipe.nome,
      posicao: equipe.posicao.toString(),
      jogos: equipe.jogos.toString(),
      vitorias: equipe.vitorias.toString(),
      empates: equipe.empates.toString(),
      derrotas: equipe.derrotas.toString(),
      gols_pro: equipe.gols_pro.toString(),
      gols_contra: equipe.gols_contra.toString(),
      logo_url: equipe.logo_url || ''
    });
    setEditingEquipe(equipe);
    setShowEquipeForm(true);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
        // Fazer scroll para baixo após selecionar imagem
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 300);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
      console.error('Erro ao selecionar imagem:', error);
    }
  };

  const uploadImage = async (imageUri) => {
    try {
      setUploadingImage(true);
      
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      });

      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.image_url;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const createArtigo = async () => {
    if (!titulo.trim() || !conteudo.trim() || !autor.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage.uri);
      }

      await axios.post(`${API_BASE_URL}/artigos`, {
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        autor: autor.trim(),
        imagem_url: imageUrl
      });
      
      setTitulo('');
      setConteudo('');
      setAutor('');
      setSelectedImage(null);
      setShowForm(false);
      fetchArtigos();
      Alert.alert('Sucesso', 'Notícia publicada com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível publicar a notícia');
      console.error('Erro ao criar artigo:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteArtigo = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/artigos/${id}`);
      fetchArtigos();
      Alert.alert('Sucesso', 'Artigo deletado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível deletar o artigo');
      console.error('Erro ao deletar artigo:', error);
    }
  };

  const handleArtigoPress = (artigo) => {
    setSelectedArtigo(artigo);
    setShowArtigoDetail(true);
  };

  const closeArtigoDetail = () => {
    setShowArtigoDetail(false);
    setTimeout(() => setSelectedArtigo(null), 300);
  };

  // Função para abreviar nomes de equipes
  const abreviarNomeEquipe = (nome) => {
    const abreviacoes = {
      'UD Songo': 'UD Songo',
      'Ferroviário': 'Ferr.',
      'Black Bulls': 'B. Bulls',
      'Ferroviário Beira': 'Ferr. Beira',
      'Ferroviário Lichingenda': 'Ferr. Lich.',
      'Costa do Sol': 'C. Sol',
      'Liga Muçulmana': 'L. Muçul.',
      'Desportivo Nampula': 'D. Nampula',
      'Chibuto': 'Chibuto',
      'Maxaquene': 'Maxaq.',
      'Textáfrica': 'Textáfr.',
      'Palmeiras': 'Palmeiras',
      'Estrela Vermelha': 'E. Vermelha',
      'Nacala': 'Nacala',
      'Desportivo Matola': 'D. Matola',
      'ENH Vilankulo': 'ENH Vil.',
      'Baia de Pemba': 'B. Pemba',
      'Ferroviario Nampula': 'Ferr. Namp.'
    };

    // Verificar se já existe abreviação
    if (abreviacoes[nome]) {
      return abreviacoes[nome];
    }

    // Se não tiver abreviação específica, criar uma genérica
    const palavras = nome.split(' ');
    if (palavras.length <= 2) {
      return nome.length > 12 ? nome.substring(0, 12) + '..' : nome;
    }
    
    // Pegar iniciais das primeiras palavras
    return palavras.slice(0, 2).map(p => p[0]).join('.') + '.';
  };

  const renderArtigo = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={600}
      delay={index * 100}
      useNativeDriver={true}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          artigoCardRefs.current[item.id]?.pulse(300);
          setTimeout(() => handleArtigoPress(item), 150);
        }}
        style={styles.artigoCardTouchable}
      >
        <Animatable.View
          ref={(ref) => {
            if (ref) {
              artigoCardRefs.current[item.id] = ref;
            }
          }}
          animation="fadeIn"
          duration={400}
          delay={index * 100 + 100}
          useNativeDriver={true}
          style={styles.artigoCard}
        >
          <View style={styles.artigoHeader}>
            <View style={styles.artigoInfo}>
              <Text style={styles.artigoTitulo}>{item.titulo}</Text>
              <Text style={styles.artigoAutor}>Por: {item.autor}</Text>
              <Text style={styles.artigoData}>
                {new Date(item.data_criacao).toLocaleDateString('pt-BR')}
              </Text>
            </View>
            {userType === 'admin' && (
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  artigoCardRefs.current[item.id]?.swing(800);
                  setTimeout(() => deleteArtigo(item.id), 400);
                }}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {item.imagem_url && (
            <Animatable.View
              animation="zoomIn"
              duration={500}
              delay={200}
              useNativeDriver={true}
            >
              <Image 
                source={{ uri: item.imagem_url }} 
                style={styles.artigoImagem}
                resizeMode="cover"
              />
            </Animatable.View>
          )}
          
          <Text style={styles.artigoConteudo} numberOfLines={3}>
            {item.conteudo}
          </Text>
          
          <View style={styles.readMoreContainer}>
            <Text style={styles.readMoreText}>Toque para ler mais →</Text>
          </View>
        </Animatable.View>
      </TouchableOpacity>
    </Animatable.View>
  );

  const renderLoginScreen = () => (
    <View style={styles.loginContainer}>
      {/* Header com nome da app no centro */}
        <View style={styles.loginHeader}>
          <View style={styles.headerSpacer} />
          <Animatable.Text 
            style={styles.loginTitle}
            animation="bounceIn"
            duration={1500}
            delay={300}
          >
            <Animatable.Text
              animation="pulse"
              iterationCount="infinite"
              duration={2000}
              delay={1800}
            >
              <Animatable.Text
                animation="bounce"
                iterationCount="infinite"
                duration={3000}
                delay={2000}
              >
                MozaFut
              </Animatable.Text>
            </Animatable.Text>
          </Animatable.Text>
          <View style={styles.headerSpacer} />
        </View>

      {/* Formulário */}
      <View style={styles.loginForm}>
        {/* Campo Email */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <View style={styles.inputIconContainer}>
              <Text style={styles.inputIcon}>📧</Text>
            </View>
          <TextInput
            style={styles.inputField}
            placeholder="Email"
            placeholderTextColor="#999"
            value={loginForm.email}
            onChangeText={(text) => setLoginForm({...loginForm, email: text})}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          </View>
          <View style={styles.inputUnderline} />
        </View>

        {/* Campo Password */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <View style={styles.inputIconContainer}>
              <Text style={styles.inputIcon}>🔒</Text>
            </View>
            <TextInput
              style={styles.inputField}
              placeholder="Senha"
              placeholderTextColor="#999"
              value={loginForm.password}
              onChangeText={(text) => setLoginForm({...loginForm, password: text})}
              secureTextEntry
            />
          </View>
          <View style={styles.inputUnderline} />
        </View>

        {/* Campo Confirm Password (apenas no modo Sign Up) */}
        {!isLoginMode && (
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <View style={styles.inputIconContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
              </View>
              <TextInput
                style={styles.inputField}
                placeholder="Confirmar Senha"
                placeholderTextColor="#999"
                value={loginForm.confirmPassword}
                onChangeText={(text) => setLoginForm({...loginForm, confirmPassword: text})}
                secureTextEntry
              />
            </View>
            <View style={styles.inputUnderline} />
          </View>
        )}

        {/* Mensagem de erro */}
        {loginError ? (
          <Text style={styles.errorText}>{loginError}</Text>
        ) : null}

        {/* Botão de ação */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={isLoginMode ? handleLogin : handleSignup}
        >
          <Text style={styles.actionButtonText}>
            {isLoginMode ? 'Entrar' : 'Cadastrar'}
          </Text>
        </TouchableOpacity>

        {/* Link para alternar modo */}
        <View style={styles.switchModeContainer}>
          <Text style={styles.switchModeText}>
            {isLoginMode ? 'Primeira vez aqui? ' : 'Já tem uma conta? '}
            <Text style={styles.switchModeLink} onPress={toggleMode}>
              {isLoginMode ? 'Cadastrar.' : 'Entrar.'}
            </Text>
          </Text>
        </View>

        {/* Introdução da Revista */}
        {isLoginMode && (
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>Sobre a MozaFut</Text>
            <Text style={styles.introText}>
              A <Text style={styles.introItalic}>MozaFut</Text> é sua fonte definitiva de notícias e informações sobre futebol moçambicano. 
              Mantenha-se atualizado com as últimas notícias, resultados dos jogos, classificações das equipes 
              e muito mais do mundo do futebol em Moçambique.
            </Text>
            <Text style={styles.introSubtext}>
              Conecte-se com a paixão pelo futebol moçambicano!
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Notícias':
        return (
          <View style={styles.tabContent}>
            <View style={styles.headerSection}>
              <Text style={styles.sectionTitle}>Últimas Notícias</Text>
              {userType === 'admin' && (
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => setShowForm(!showForm)}
                >
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {showForm && (
              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="Título da notícia"
                  placeholderTextColor="#999"
                  value={titulo}
                  onChangeText={setTitulo}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Autor"
                  placeholderTextColor="#999"
                  value={autor}
                  onChangeText={setAutor}
                />
                
                {/* Seção de Imagem */}
                <View style={styles.imageSection}>
                  <Text style={styles.imageLabel}>Imagem da Notícia (Opcional)</Text>
                  {selectedImage ? (
                    <View style={styles.imagePreview}>
                      <Image 
                        source={{ uri: selectedImage.uri }} 
                        style={styles.previewImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity 
                        style={styles.removeImageButton}
                        onPress={() => setSelectedImage(null)}
                      >
                        <Text style={styles.removeImageText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.imagePickerButton}
                      onPress={pickImage}
                    >
                      <Text style={styles.imagePickerText}>📷 Adicionar Imagem</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Conteúdo da notícia"
                  placeholderTextColor="#999"
                  value={conteudo}
                  onChangeText={setConteudo}
                  multiline
                  numberOfLines={4}
                />
                <View style={styles.formButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowForm(false);
                      setSelectedImage(null);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.createButton}
                    onPress={createArtigo}
                    disabled={loading || uploadingImage}
                  >
                    <Text style={styles.createButtonText}>
                      {loading ? (uploadingImage ? 'Enviando imagem...' : 'Publicando...') : 'Publicar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Carrossel de Notícias no Topo */}
            {artigos.length > 0 && (
              <Animatable.View
                key={currentCarouselIndex}
                animation="fadeInRight"
                duration={800}
                style={styles.carouselContainer}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => handleArtigoPress(artigos[currentCarouselIndex])}
                  style={styles.carouselCard}
                >
                  {artigos[currentCarouselIndex].imagem_url ? (
                    <Image
                      source={{ uri: artigos[currentCarouselIndex].imagem_url }}
                      style={styles.carouselImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.carouselImagePlaceholder}>
                      <Text style={styles.carouselImagePlaceholderText}>📰</Text>
                    </View>
                  )}
                  
                  <View style={styles.carouselOverlay}>
                    <View style={styles.carouselContent}>
                      <Animatable.Text
                        animation="fadeInUp"
                        duration={600}
                        delay={200}
                        style={styles.carouselTitulo}
                        numberOfLines={2}
                      >
                        {artigos[currentCarouselIndex].titulo}
                      </Animatable.Text>
                      
                      <Animatable.View
                        animation="fadeInUp"
                        duration={600}
                        delay={300}
                        style={styles.carouselMeta}
                      >
                        <Text style={styles.carouselAutor}>
                          Por: {artigos[currentCarouselIndex].autor}
                        </Text>
                        <Text style={styles.carouselData}>
                          {new Date(artigos[currentCarouselIndex].data_criacao).toLocaleDateString('pt-BR')}
                        </Text>
                      </Animatable.View>
                      
                      <Animatable.Text
                        animation="fadeInUp"
                        duration={600}
                        delay={400}
                        style={styles.carouselPreview}
                        numberOfLines={2}
                      >
                        {artigos[currentCarouselIndex].conteudo}
                      </Animatable.Text>
                    </View>
                  </View>
                  
                  {/* Indicadores de Notícias */}
                  <View style={styles.carouselIndicators}>
                    {artigos.slice(0, Math.min(artigos.length, 5)).map((_, index) => (
                      <Animatable.View
                        key={index}
                        animation={currentCarouselIndex === index ? "pulse" : "fadeIn"}
                        duration={300}
                        style={[
                          styles.carouselIndicator,
                          currentCarouselIndex === index && styles.carouselIndicatorActive
                        ]}
                      />
                    ))}
                  </View>
                </TouchableOpacity>
              </Animatable.View>
            )}

            {/* Lista de Notícias (começando da segunda se houver carrossel) */}
            <FlatList
              data={artigos.length > 1 ? artigos.slice(1) : artigos}
              renderItem={({ item, index }) => renderArtigo({ 
                item, 
                index: artigos.length > 1 ? index + 1 : index 
              })}
              keyExtractor={(item) => item.id.toString()}
              refreshing={loading}
              onRefresh={fetchArtigos}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                artigos.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Nenhuma notícia disponível</Text>
                  </View>
                ) : null
              }
            />
    </View>
  );
      
      case 'Resultados':
        return (
          <View style={styles.tabContent}>
            <View style={styles.headerSection}>
              <Text style={styles.sectionTitle}>Resultados</Text>
              {userType === 'admin' && (
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => setShowResultadoForm(!showResultadoForm)}
                >
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Formulário de Resultado */}
            {showResultadoForm && (
              <View style={styles.form}>
                <Text style={styles.formTitle}>
                  {editingResultado ? 'Editar Resultado' : 'Adicionar Resultado'}
                </Text>
                
                <View style={styles.formRow}>
                  <View style={styles.formColumn}>
                    <Text style={styles.inputLabel}>Ronda *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="19"
                      placeholderTextColor="#999"
                      value={resultadoForm.ronda}
                      onChangeText={(text) => setResultadoForm({...resultadoForm, ronda: text})}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.formColumn}>
                    <Text style={styles.inputLabel}>Data do Jogo *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="2024-10-28"
                      placeholderTextColor="#999"
                      value={resultadoForm.data_jogo}
                      onChangeText={(text) => setResultadoForm({...resultadoForm, data_jogo: text})}
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={styles.formColumn}>
                    <Text style={styles.inputLabel}>Time Casa *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="UD Songo"
                      placeholderTextColor="#999"
                      value={resultadoForm.time_casa}
                      onChangeText={(text) => setResultadoForm({...resultadoForm, time_casa: text})}
                    />
                  </View>
                  <View style={styles.formColumn}>
                    <Text style={styles.inputLabel}>Time Fora *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Desportivo Matola"
                      placeholderTextColor="#999"
                      value={resultadoForm.time_fora}
                      onChangeText={(text) => setResultadoForm({...resultadoForm, time_fora: text})}
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={styles.formColumn}>
                    <Text style={styles.inputLabel}>Gols Casa *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="4"
                      placeholderTextColor="#999"
                      value={resultadoForm.gols_casa}
                      onChangeText={(text) => setResultadoForm({...resultadoForm, gols_casa: text})}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.formColumn}>
                    <Text style={styles.inputLabel}>Gols Fora *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor="#999"
                      value={resultadoForm.gols_fora}
                      onChangeText={(text) => setResultadoForm({...resultadoForm, gols_fora: text})}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Seção de Logo */}
                <View style={styles.imageSection}>
                  <Text style={styles.imageLabel}>Logo do Time Casa (Opcional)</Text>
                  {selectedImage ? (
                    <View style={styles.imagePreview}>
                      <Image 
                        source={{ uri: selectedImage.uri }} 
                        style={styles.previewImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity 
                        style={styles.removeImageButton}
                        onPress={() => setSelectedImage(null)}
                      >
                        <Text style={styles.removeImageText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.imagePickerButton}
                      onPress={pickImage}
                    >
                      <Text style={styles.imagePickerText}>⚽ Adicionar Logo</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.formButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={resetResultadoForm}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.createButton}
                    onPress={editingResultado ? updateResultado : createResultado}
                    disabled={loading || uploadingImage}
                  >
                    <Text style={styles.createButtonText}>
                      {loading ? (uploadingImage ? 'Enviando...' : 'Salvando...') : 
                       (editingResultado ? 'Atualizar' : 'Adicionar')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {/* Lista de Resultados */}
            <View style={styles.resultadosContainer}>
              {resultados.map((resultado, index) => (
                <View key={resultado.id} style={styles.resultadoCard}>
                  <View style={styles.rondaHeader}>
                    <View style={styles.rondaInfo}>
                      <Text style={styles.rondaText}>RONDA {resultado.ronda}</Text>
                      <Text style={styles.dateText}>
                        {new Date(resultado.data_jogo).toLocaleDateString('pt-BR', { 
                          day: '2-digit', 
                          month: '2-digit' 
                        })}
                      </Text>
                    </View>
                    {userType === 'admin' && (
                      <View style={styles.resultadoActions}>
                        <TouchableOpacity 
                          style={styles.editButton}
                          onPress={() => editResultado(resultado)}
                        >
                          <Text style={styles.editButtonText}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.deleteButton}
                          onPress={() => deleteResultado(resultado.id)}
                        >
                          <Text style={styles.deleteButtonText}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.matchContainer}>
                    <View style={styles.teamRow}>
                      <View style={styles.teamInfo}>
                        <View style={styles.teamLogo}>
                          {resultado.logo_casa ? (
                            <Image source={{ uri: resultado.logo_casa }} style={styles.teamLogoImage} />
                          ) : (
                            <Text style={styles.logoText}>⚽</Text>
                          )}
                        </View>
                        <Text style={styles.teamName}>{resultado.time_casa}</Text>
                      </View>
                      <View style={styles.scoreContainer}>
                        <Text style={styles.scoreText}>{resultado.gols_casa}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.teamRow}>
                      <View style={styles.teamInfo}>
                        <View style={styles.teamLogo}>
                          {resultado.logo_fora ? (
                            <Image source={{ uri: resultado.logo_fora }} style={styles.teamLogoImage} />
                          ) : (
                            <Text style={styles.logoText}>⚽</Text>
                          )}
                        </View>
                        <Text style={styles.teamName}>{resultado.time_fora}</Text>
                      </View>
                      <View style={styles.scoreContainer}>
                        <Text style={styles.scoreText}>{resultado.gols_fora}</Text>
                      </View>
                    </View>
                    
                  </View>
                </View>
              ))}
            </View>
          </View>
        );
      
      case 'Classificação':
        return (
          <View style={styles.tabContent}>
            <View style={styles.headerSection}>
              <Text style={styles.sectionTitle}>Classificação</Text>
              {userType === 'admin' && (
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => setShowEquipeForm(!showEquipeForm)}
                >
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Formulário de Equipe */}
            {showEquipeForm && (
              <View style={styles.form}>
                <Text style={styles.formTitle}>
                  {editingEquipe ? 'Editar Equipe' : 'Adicionar Equipe'}
                </Text>
                
                <View style={styles.formRow}>
                  <View style={styles.formColumn}>
                    <Text style={styles.inputLabel}>Nome da Equipe *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: UD Songo"
                      placeholderTextColor="#999"
                      value={equipeForm.nome}
                      onChangeText={(text) => setEquipeForm({...equipeForm, nome: text})}
                    />
                  </View>
                  <View style={styles.formColumn}>
                    <Text style={styles.inputLabel}>Posição *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="1"
                      placeholderTextColor="#999"
                      value={equipeForm.posicao}
                      onChangeText={(text) => setEquipeForm({...equipeForm, posicao: text})}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={styles.formColumn}>
                    <Text style={styles.inputLabel}>Jogos (J) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="18"
                      placeholderTextColor="#999"
                      value={equipeForm.jogos}
                      onChangeText={(text) => setEquipeForm({...equipeForm, jogos: text})}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.formColumn}>
                    <Text style={styles.inputLabel}>Vitórias (V) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="15"
                      placeholderTextColor="#999"
                      value={equipeForm.vitorias}
                      onChangeText={(text) => setEquipeForm({...equipeForm, vitorias: text})}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={styles.formColumn}>
                    <Text style={styles.inputLabel}>Empates (E) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="2"
                      placeholderTextColor="#999"
                      value={equipeForm.empates}
                      onChangeText={(text) => setEquipeForm({...equipeForm, empates: text})}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.formColumn}>
                    <Text style={styles.inputLabel}>Derrotas (D) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="1"
                      placeholderTextColor="#999"
                      value={equipeForm.derrotas}
                      onChangeText={(text) => setEquipeForm({...equipeForm, derrotas: text})}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={styles.formColumn}>
                    <Text style={styles.inputLabel}>Gols Pró (G) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="40"
                      placeholderTextColor="#999"
                      value={equipeForm.gols_pro}
                      onChangeText={(text) => setEquipeForm({...equipeForm, gols_pro: text})}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.formColumn}>
                    <Text style={styles.inputLabel}>Gols Contra *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="10"
                      placeholderTextColor="#999"
                      value={equipeForm.gols_contra}
                      onChangeText={(text) => setEquipeForm({...equipeForm, gols_contra: text})}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Seção de Logo */}
                <View style={styles.imageSection}>
                  <Text style={styles.imageLabel}>Logo da Equipe (Opcional)</Text>
                  {selectedImage ? (
                    <View style={styles.imagePreview}>
                      <Image 
                        source={{ uri: selectedImage.uri }} 
                        style={styles.previewImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity 
                        style={styles.removeImageButton}
                        onPress={() => setSelectedImage(null)}
                      >
                        <Text style={styles.removeImageText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.imagePickerButton}
                      onPress={pickImage}
                    >
                      <Text style={styles.imagePickerText}>🏆 Adicionar Logo</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.formButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={resetEquipeForm}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.createButton}
                    onPress={editingEquipe ? updateEquipe : createEquipe}
                    disabled={loading || uploadingImage}
                  >
                    <Text style={styles.createButtonText}>
                      {loading ? (uploadingImage ? 'Enviando...' : 'Salvando...') : 
                       (editingEquipe ? 'Atualizar' : 'Adicionar')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {/* Filtros */}
            <View style={styles.filterContainer}>
              {['TOTAL', 'CASA', 'FORA'].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterButton,
                    classificacaoFilter === filter && styles.activeFilterButton
                  ]}
                  onPress={() => setClassificacaoFilter(filter)}
                >
                  <Text style={[
                    styles.filterText,
                    classificacaoFilter === filter && styles.activeFilterText
                  ]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tabela de Classificação */}
            <View style={styles.tableContainer}>
              {/* Cabeçalho da Tabela */}
              <View style={styles.tableHeader}>
                <View style={[styles.headerCell, { width: 30 }]}>
                  <Text style={styles.headerText}>#</Text>
                </View>
                <View style={[styles.headerCell, styles.teamCell]}>
                  <Text style={styles.headerText}>EQUIPA</Text>
                </View>
                <View style={[styles.headerCell, { width: 30 }]}>
                  <Text style={styles.headerText}>PJ</Text>
                </View>
                <View style={[styles.headerCell, { width: 28 }]}>
                  <Text style={styles.headerText}>V</Text>
                </View>
                <View style={[styles.headerCell, { width: 28 }]}>
                  <Text style={styles.headerText}>E</Text>
                </View>
                <View style={[styles.headerCell, { width: 28 }]}>
                  <Text style={styles.headerText}>D</Text>
                </View>
                <View style={[styles.headerCell, { width: 45 }]}>
                  <Text style={styles.headerText}>G</Text>
                </View>
                <View style={[styles.headerCell, { width: 35 }]}>
                  <Text style={styles.headerText}>DG</Text>
                </View>
              </View>

              {/* Linhas da Tabela */}
              <ScrollView showsVerticalScrollIndicator={false}>
                {equipes.map((equipe, index) => (
                  <View key={equipe.id} style={styles.tableRow}>
                    <View style={[styles.cell, { width: 30 }]}>
                      <Text style={[
                        styles.positionText,
                        equipe.posicao === 1 && styles.firstPlace,
                        equipe.posicao === equipes.length && styles.lastPlace
                      ]}>
                        {equipe.posicao}
                      </Text>
                    </View>
                    <View style={[styles.cell, styles.teamCell]}>
                      <View style={styles.teamInfo}>
                        <View style={styles.teamLogo}>
                          {equipe.logo_url ? (
                            <Image source={{ uri: equipe.logo_url }} style={styles.teamLogoImage} />
                          ) : (
                            <Text style={styles.logoText}>⚽</Text>
                          )}
                        </View>
                        <Text style={styles.teamName} numberOfLines={1}>
                          {abreviarNomeEquipe(equipe.nome)}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.cell, { width: 30 }]}>
                      <Text style={styles.cellText}>{equipe.jogos}</Text>
                    </View>
                    <View style={[styles.cell, { width: 28 }]}>
                      <Text style={styles.cellText}>{equipe.vitorias}</Text>
                    </View>
                    <View style={[styles.cell, { width: 28 }]}>
                      <Text style={styles.cellText}>{equipe.empates}</Text>
                    </View>
                    <View style={[styles.cell, { width: 28 }]}>
                      <Text style={styles.cellText}>{equipe.derrotas}</Text>
                    </View>
                    <View style={[styles.cell, { width: 45 }]}>
                      <Text style={styles.cellText}>
                        {equipe.gols_pro}:{equipe.gols_contra}
                      </Text>
                    </View>
                    <View style={[styles.cell, { width: 35 }]}>
                      <Text style={[
                        styles.cellText,
                        equipe.diferenca_gols > 0 && styles.positiveDiff,
                        equipe.diferenca_gols < 0 && styles.negativeDiff
                      ]}>
                        {equipe.diferenca_gols > 0 ? '+' : ''}{equipe.diferenca_gols}
                      </Text>
                    </View>
                    {userType === 'admin' && (
                      <View style={[styles.cell, { width: 50 }]}>
                        <View style={styles.actionButtons}>
                          <TouchableOpacity 
                            style={styles.editButton}
                            onPress={() => editEquipe(equipe)}
                          >
                            <Text style={styles.editButtonText}>✏️</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.deleteButton}
                            onPress={() => deleteEquipe(equipe.id)}
                          >
                            <Text style={styles.deleteButtonText}>🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        );
      
      case 'Pesquisa':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Pesquisar Notícias</Text>
            
            {/* Barra de Pesquisa */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Digite para pesquisar..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity 
                    style={styles.clearButton}
                    onPress={clearSearch}
                  >
                    <Text style={styles.clearButtonText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Resultados da Pesquisa */}
            {isSearching ? (
              <View style={styles.searchResults}>
                {filteredArtigos.length > 0 ? (
                  <FlatList
                    data={filteredArtigos}
                    renderItem={({ item, index }) => renderArtigo({ item, index })}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                  />
                ) : (
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsIcon}>🔍</Text>
                    <Text style={styles.noResultsTitle}>Nenhuma notícia encontrada</Text>
                    <Text style={styles.noResultsText}>
                      Tente pesquisar por palavras diferentes ou verifique a ortografia.
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.searchPlaceholder}>
                <Text style={styles.searchPlaceholderIcon}>🔍</Text>
                <Text style={styles.searchPlaceholderTitle}>Pesquise por notícias</Text>
                <Text style={styles.searchPlaceholderText}>
                  Digite palavras-chave no campo acima para encontrar notícias específicas.
                </Text>
              </View>
            )}
          </View>
        );

      case 'Perfil':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Configurações do Usuário</Text>
            
            {/* Informações do Usuário */}
            <View style={[styles.profileCard, { backgroundColor: isDarkTheme ? '#2a2a2a' : '#f5f5f5' }]}>
              <View style={styles.profileHeader}>
                <View style={[styles.profileAvatar, { backgroundColor: isDarkTheme ? '#00D4AA' : '#00D4AA' }]}>
                  <Text style={styles.profileAvatarText}>
                    {userType === 'admin' ? 'A' : 'U'}
                  </Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={[styles.profileName, { color: isDarkTheme ? '#fff' : '#000' }]}>
                    {currentUser?.name || (userType === 'admin' ? 'Administrador' : 'Usuário')}
                  </Text>
                  <Text style={[styles.profileEmail, { color: isDarkTheme ? '#999' : '#666' }]}>
                    {currentUser?.email || (userType === 'admin' ? 'admin@mozafut.com' : 'user@mozafut.com')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Configurações */}
            <View style={styles.settingsSection}>
              <Text style={styles.settingsTitle}>Configurações</Text>
              
              <TouchableOpacity 
                style={[styles.settingItem, { backgroundColor: isDarkTheme ? '#2a2a2a' : '#f0f0f0' }]}
                onPress={handleEditProfile}
              >
                <View style={[styles.settingIcon, { backgroundColor: isDarkTheme ? '#333' : '#ddd' }]}>
                  <Text style={styles.settingIconText}>👤</Text>
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingLabel, { color: isDarkTheme ? '#fff' : '#000' }]}>Editar Perfil</Text>
                  <Text style={[styles.settingDescription, { color: isDarkTheme ? '#999' : '#666' }]}>Alterar informações pessoais</Text>
                </View>
                <Text style={[styles.settingArrow, { color: isDarkTheme ? '#999' : '#666' }]}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.settingItem, { backgroundColor: isDarkTheme ? '#2a2a2a' : '#f0f0f0' }]}
                onPress={() => Alert.alert('Notificações', 'Funcionalidade em desenvolvimento')}
              >
                <View style={[styles.settingIcon, { backgroundColor: isDarkTheme ? '#333' : '#ddd' }]}>
                  <Text style={styles.settingIconText}>🔔</Text>
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingLabel, { color: isDarkTheme ? '#fff' : '#000' }]}>Notificações</Text>
                  <Text style={[styles.settingDescription, { color: isDarkTheme ? '#999' : '#666' }]}>Gerenciar alertas e notificações</Text>
                </View>
                <Text style={[styles.settingArrow, { color: isDarkTheme ? '#999' : '#666' }]}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.settingItem, { backgroundColor: isDarkTheme ? '#2a2a2a' : '#f0f0f0' }]}
                onPress={toggleTheme}
              >
                <View style={[styles.settingIcon, { backgroundColor: isDarkTheme ? '#333' : '#ddd' }]}>
                  <Text style={styles.settingIconText}>{isDarkTheme ? '🌙' : '☀️'}</Text>
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingLabel, { color: isDarkTheme ? '#fff' : '#000' }]}>Tema</Text>
                  <Text style={[styles.settingDescription, { color: isDarkTheme ? '#999' : '#666' }]}>
                    {isDarkTheme ? 'Modo escuro ativo' : 'Modo claro ativo'}
                  </Text>
                </View>
                <Text style={[styles.settingArrow, { color: isDarkTheme ? '#999' : '#666' }]}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingIcon}>
                  <Text style={styles.settingIconText}>🔒</Text>
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Privacidade</Text>
                  <Text style={styles.settingDescription}>Configurações de privacidade</Text>
                </View>
                <Text style={styles.settingArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Informações do App */}
            <View style={styles.appInfoSection}>
              <Text style={styles.appInfoTitle}>Informações do App</Text>
              <View style={styles.appInfoItem}>
                <Text style={styles.appInfoLabel}>Versão</Text>
                <Text style={styles.appInfoValue}>1.0.0</Text>
              </View>
              <View style={styles.appInfoItem}>
                <Text style={styles.appInfoLabel}>Desenvolvido por</Text>
                <Text style={styles.appInfoValue}>MozaFut Team</Text>
              </View>
            </View>

            {/* Botão de Logout */}
            <TouchableOpacity 
              style={styles.logoutButtonProfile}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonProfileText}>Sair da Conta</Text>
            </TouchableOpacity>

            {/* Modal de Edição de Perfil */}
            {showEditProfile && (
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: isDarkTheme ? '#2a2a2a' : '#fff' }]}>
                  <Text style={[styles.modalTitle, { color: isDarkTheme ? '#fff' : '#000' }]}>
                    Editar Perfil
                  </Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: isDarkTheme ? '#fff' : '#000' }]}>Nome</Text>
                    <TextInput
                      style={[styles.modalInput, { 
                        backgroundColor: isDarkTheme ? '#1a1a1a' : '#f5f5f5',
                        color: isDarkTheme ? '#fff' : '#000',
                        borderColor: isDarkTheme ? '#333' : '#ddd'
                      }]}
                      placeholder="Digite seu nome"
                      placeholderTextColor={isDarkTheme ? '#999' : '#666'}
                      value={profileData.name}
                      onChangeText={(text) => setProfileData({...profileData, name: text})}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: isDarkTheme ? '#fff' : '#000' }]}>Email</Text>
                    <TextInput
                      style={[styles.modalInput, { 
                        backgroundColor: isDarkTheme ? '#1a1a1a' : '#f5f5f5',
                        color: isDarkTheme ? '#fff' : '#000',
                        borderColor: isDarkTheme ? '#333' : '#ddd'
                      }]}
                      placeholder="Digite seu email"
                      placeholderTextColor={isDarkTheme ? '#999' : '#666'}
                      value={profileData.email}
                      onChangeText={(text) => setProfileData({...profileData, email: text})}
                      keyboardType="email-address"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: isDarkTheme ? '#fff' : '#000' }]}>Telefone</Text>
                    <TextInput
                      style={[styles.modalInput, { 
                        backgroundColor: isDarkTheme ? '#1a1a1a' : '#f5f5f5',
                        color: isDarkTheme ? '#fff' : '#000',
                        borderColor: isDarkTheme ? '#333' : '#ddd'
                      }]}
                      placeholder="Digite seu telefone"
                      placeholderTextColor={isDarkTheme ? '#999' : '#666'}
                      value={profileData.phone}
                      onChangeText={(text) => setProfileData({...profileData, phone: text})}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={cancelEditProfile}
                    >
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.saveButton]}
                      onPress={saveProfile}
                    >
                      <Text style={styles.saveButtonText}>Salvar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        );
      
      default:
        return null;
    }
  };

  // Se não estiver logado, mostrar tela de login
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        {renderLoginScreen()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkTheme ? '#1a1a1a' : '#fff' }]}>
      <StatusBar style={isDarkTheme ? "light" : "dark"} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Animatable.View 
            style={styles.logoContainer}
            animation="pulse"
            iterationCount="infinite"
            duration={2000}
          >
            <Animatable.Text 
              style={styles.logo}
              animation="bounceIn"
              duration={1500}
              delay={500}
            >
              MozaFut
            </Animatable.Text>
          </Animatable.View>
          
          {/* Indicador de usuário e botão de logout */}
          <View style={styles.userInfo}>
            <Text style={styles.userTypeText}>
              {userType === 'admin' ? 'Admin' : 'Usuário'}
            </Text>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['Notícias', 'Resultados', 'Classificação', 'Perfil'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => handleTabChange(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderTabContent()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navItem, activeNavItem === 'Partidas' && styles.activeNavItem]}
          onPress={() => {
            setActiveNavItem('Partidas');
            handleTabChange('Notícias');
          }}
        >
          <View style={[styles.navIconContainer, activeNavItem === 'Partidas' && styles.activeNavIconContainer]}>
            <MaterialCommunityIcons 
              name="soccer" 
              size={20} 
              color={activeNavItem === 'Partidas' ? '#1a1a1a' : '#00D4AA'} 
            />
          </View>
          <Text style={[styles.navText, activeNavItem === 'Partidas' && styles.activeNavText]}>Partidas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navItem, activeNavItem === 'Pesquisa' && styles.activeNavItem]}
          onPress={() => {
            setActiveNavItem('Pesquisa');
            handleTabChange('Pesquisa');
          }}
        >
          <View style={[styles.navIconContainer, activeNavItem === 'Pesquisa' && styles.activeNavIconContainer]}>
            <Ionicons 
              name="search" 
              size={20} 
              color={activeNavItem === 'Pesquisa' ? '#1a1a1a' : '#00D4AA'} 
            />
          </View>
          <Text style={[styles.navText, activeNavItem === 'Pesquisa' && styles.activeNavText]}>Pesquisa</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navItem, activeNavItem === 'Favoritos' && styles.activeNavItem]}
          onPress={() => {
            setActiveNavItem('Favoritos');
            handleTabChange('Notícias');
          }}
        >
          <View style={[styles.navIconContainer, activeNavItem === 'Favoritos' && styles.activeNavIconContainer]}>
            <Ionicons 
              name={activeNavItem === 'Favoritos' ? "heart" : "heart-outline"} 
              size={20} 
              color={activeNavItem === 'Favoritos' ? '#1a1a1a' : '#00D4AA'} 
            />
          </View>
          <Text style={[styles.navText, activeNavItem === 'Favoritos' && styles.activeNavText]}>Favoritos</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navItem, activeNavItem === 'Perfil' && styles.activeNavItem]}
          onPress={() => {
            setActiveNavItem('Perfil');
            handleTabChange('Perfil');
          }}
        >
          <View style={[styles.navIconContainer, activeNavItem === 'Perfil' && styles.activeNavIconContainer]}>
            <Ionicons 
              name={activeNavItem === 'Perfil' ? "person" : "person-outline"} 
              size={20} 
              color={activeNavItem === 'Perfil' ? '#1a1a1a' : '#00D4AA'} 
            />
          </View>
          <Text style={[styles.navText, activeNavItem === 'Perfil' && styles.activeNavText]}>Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Detalhes da Notícia */}
      {showArtigoDetail && selectedArtigo && (
        <Animatable.View
          animation="fadeIn"
          duration={300}
          style={styles.artigoDetailOverlay}
        >
          <Animatable.View
            animation="slideInUp"
            duration={400}
            style={[styles.artigoDetailModal, { backgroundColor: isDarkTheme ? '#1a1a1a' : '#ffffff' }]}
          >
            {/* Header do Modal */}
            <View style={[styles.artigoDetailHeader, { backgroundColor: isDarkTheme ? '#2a2a2a' : '#f5f5f5' }]}>
              <View style={styles.artigoDetailHeaderLeft}>
                <Text style={styles.artigoDetailHeaderTitle}>Detalhes da Notícia</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeArtigoDetail}
              >
                <Animatable.Text
                  animation="pulse"
                  iterationCount="infinite"
                  duration={1500}
                  style={styles.closeButtonText}
                >
                  ✕
                </Animatable.Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={true}
              style={styles.artigoDetailScroll}
              contentContainerStyle={styles.artigoDetailContent}
            >
              {/* Título da Notícia */}
              <Animatable.View
                animation="fadeInUp"
                duration={500}
                delay={100}
              >
                <Text style={[styles.artigoDetailTitulo, { color: isDarkTheme ? '#fff' : '#000' }]}>
                  {selectedArtigo.titulo}
                </Text>
              </Animatable.View>
              
              {/* Informações do Autor e Data */}
              <Animatable.View
                animation="fadeInUp"
                duration={500}
                delay={150}
              >
                <View style={[styles.artigoDetailMeta, { borderBottomColor: isDarkTheme ? '#333' : '#ddd' }]}>
                  <View style={styles.artigoDetailMetaItem}>
                    <Text style={[styles.artigoDetailMetaLabel, { color: isDarkTheme ? '#999' : '#666' }]}>Autor:</Text>
                    <Text style={styles.artigoDetailAutor}>
                      {selectedArtigo.autor}
                    </Text>
                  </View>
                  <View style={styles.artigoDetailMetaItem}>
                    <Text style={[styles.artigoDetailMetaLabel, { color: isDarkTheme ? '#999' : '#666' }]}>Data:</Text>
                    <Text style={[styles.artigoDetailData, { color: isDarkTheme ? '#ccc' : '#666' }]}>
                      {new Date(selectedArtigo.data_criacao).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                </View>
              </Animatable.View>

              {/* Imagem da Notícia */}
              {selectedArtigo.imagem_url && (
                <Animatable.View
                  animation="zoomIn"
                  duration={600}
                  delay={200}
                  style={styles.artigoDetailImageContainer}
                >
                  <Image
                    source={{ uri: selectedArtigo.imagem_url }}
                    style={styles.artigoDetailImagem}
                    resizeMode="cover"
                  />
                </Animatable.View>
              )}

              {/* Conteúdo Completo da Notícia */}
              <Animatable.View
                animation="fadeInUp"
                duration={500}
                delay={300}
              >
                <View style={styles.artigoDetailConteudoContainer}>
                  <Text style={styles.artigoDetailConteudoLabel}>Conteúdo:</Text>
                  <Text style={[styles.artigoDetailConteudo, { color: isDarkTheme ? '#e0e0e0' : '#333' }]}>
                    {selectedArtigo.conteudo}
                  </Text>
                </View>
              </Animatable.View>

              {/* ID da Notícia (para debug/admin) */}
              {userType === 'admin' && (
                <Animatable.View
                  animation="fadeIn"
                  duration={400}
                  delay={400}
                  style={[styles.artigoDetailAdminInfo, { backgroundColor: isDarkTheme ? '#2a2a2a' : '#f5f5f5' }]}
                >
                  <Text style={[styles.artigoDetailAdminText, { color: isDarkTheme ? '#999' : '#666' }]}>
                    ID: {selectedArtigo.id} | Criado em: {new Date(selectedArtigo.data_criacao).toISOString()}
                  </Text>
                </Animatable.View>
              )}
            </ScrollView>
          </Animatable.View>
        </Animatable.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  
  // Header Styles
  header: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center'
  },
  logo: {
    color: '#00D4AA',
    fontSize: 30,
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowColor: '#00D4AA',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // Tab Navigation Styles
  tabContainer: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 12,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 15,
  },
  activeTab: {
    backgroundColor: '#4a4a4a',
  },
  tabText: {
    color: '#ccc',
    fontSize: 15,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#00D4AA',
    fontWeight: 'bold',
  },

  // Content Styles
  content: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContent: {
    flex: 1,
  },
  tabContent: {
    padding: 15,
    paddingBottom: 100, // Espaço extra para o botão não ficar escondido
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#00D4AA',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },

  // Form Styles
  form: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#3a3a3a',
    borderWidth: 1,
    borderColor: '#4a4a4a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#4a4a4a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#00D4AA',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Article Card Styles
  artigoCard: {
    backgroundColor: '#2a2a2a',
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  artigoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  artigoInfo: {
    flex: 1,
  },
  artigoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    lineHeight: 24,
  },
  artigoAutor: {
    fontSize: 14,
    color: '#00D4AA',
    marginBottom: 5,
  },
  artigoData: {
    fontSize: 12,
    color: '#999',
  },
  artigoConteudo: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 22,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Placeholder Styles
  placeholderCard: {
    backgroundColor: '#2a2a2a',
    padding: 40,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },

  // Bottom Navigation Styles
  bottomNav: {
    backgroundColor: '#2a2a2a',
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navText: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '500',
  },

  // Image Styles
  imageSection: {
    marginBottom: 15,
  },
  imageLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  imagePickerButton: {
    backgroundColor: '#3a3a3a',
    borderWidth: 2,
    borderColor: '#4a4a4a',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerText: {
    color: '#00D4AA',
    fontSize: 16,
    fontWeight: '500',
  },
  imagePreview: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ff4444',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  artigoImagem: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  artigoCardTouchable: {
    marginBottom: 15,
  },
  readMoreContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
    alignItems: 'flex-end',
  },
  readMoreText: {
    color: '#00D4AA',
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
  },

  // Carrossel Styles
  carouselContainer: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  carouselCard: {
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  carouselImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  carouselImagePlaceholderText: {
    fontSize: 60,
    opacity: 0.3,
  },
  carouselOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: 20,
    borderRadius: 20,
  },
  carouselContent: {
    width: '100%',
  },
  carouselTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 30,
  },
  carouselMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  carouselAutor: {
    fontSize: 14,
    color: '#00D4AA',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  carouselData: {
    fontSize: 12,
    color: '#ccc',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  carouselPreview: {
    fontSize: 14,
    color: '#e0e0e0',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  carouselIndicators: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  carouselIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 3,
  },
  carouselIndicatorActive: {
    width: 20,
    backgroundColor: '#00D4AA',
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },

  // Artigo Detail Modal Styles
  artigoDetailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  artigoDetailModal: {
    height: '100%',
    width: '100%',
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  artigoDetailScroll: {
    flex: 1,
  },
  artigoDetailContent: {
    padding: 20,
    paddingBottom: 40,
  },
  artigoDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#00D4AA',
  },
  artigoDetailHeaderLeft: {
    flex: 1,
  },
  artigoDetailHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00D4AA',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  artigoDetailTitulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    lineHeight: 36,
  },
  artigoDetailMeta: {
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  artigoDetailMetaItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  artigoDetailMetaLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 10,
    minWidth: 60,
  },
  artigoDetailAutor: {
    fontSize: 16,
    color: '#00D4AA',
    fontWeight: '600',
    flex: 1,
  },
  artigoDetailData: {
    fontSize: 15,
    flex: 1,
  },
  artigoDetailImageContainer: {
    marginBottom: 25,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  artigoDetailImagem: {
    width: '100%',
    height: 300,
    borderRadius: 15,
  },
  artigoDetailConteudoContainer: {
    marginTop: 10,
  },
  artigoDetailConteudoLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00D4AA',
    marginBottom: 15,
  },
  artigoDetailConteudo: {
    fontSize: 18,
    lineHeight: 30,
    textAlign: 'justify',
  },
  artigoDetailAdminInfo: {
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#00D4AA',
  },
  artigoDetailAdminText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },

  // Classification Table Styles
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#4a4a4a',
  },
  filterText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tableContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#3a3a3a',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  headerCell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  teamCell: {
    flex: 1,
    alignItems: 'flex-start',
    minWidth: 90,
    maxWidth: 120,
  },
  headerText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
    alignItems: 'center',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  positionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  firstPlace: {
    color: '#00D4AA',
  },
  lastPlace: {
    color: '#ff4444',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4a4a4a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  logoText: {
    fontSize: 10,
  },
  teamName: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  cellText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  positiveDiff: {
    color: '#00D4AA',
  },
  negativeDiff: {
    color: '#ff4444',
  },

  // Form Styles
  formTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  formColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  teamLogoImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#00D4AA',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 3,
  },
  editButtonText: {
    fontSize: 10,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 10,
  },

  // Resultados Styles
  resultadosContainer: {
    marginTop: 10,
  },
  resultadoCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#00D4AA',
  },
  rondaHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rondaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rondaText: {
    color: '#00D4AA',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginRight: 15,
  },
  matchContainer: {
    position: 'relative',
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  teamName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  scoreContainer: {
    minWidth: 30,
    alignItems: 'center',
  },
  scoreText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '500',
  },
  resultadoActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Bottom Navigation Styles
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderTopWidth: 2,
    borderTopColor: '#00D4AA',
    shadowColor: '#00D4AA',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  navIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 2,
    borderColor: '#00D4AA',
    shadowColor: '#00D4AA',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  navText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  activeNavItem: {
    backgroundColor: '#00D4AA20',
    borderRadius: 12,
  },
  activeNavIconContainer: {
    backgroundColor: '#00D4AA',
    borderColor: '#00D4AA',
    shadowColor: '#00D4AA',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    transform: [{ scale: 1.05 }],
  },
  activeNavText: {
    color: '#00D4AA',
    fontWeight: 'bold',
    fontSize: 12,
  },

  // Search Styles
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#00D4AA',
    shadowColor: '#00D4AA',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  searchIcon: {
    fontSize: 18,
    color: '#00D4AA',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchResults: {
    flex: 1,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 20,
    opacity: 0.5,
  },
  noResultsTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  noResultsText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
  searchPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  searchPlaceholderIcon: {
    fontSize: 64,
    marginBottom: 20,
    opacity: 0.3,
  },
  searchPlaceholderTitle: {
    color: '#00D4AA',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  searchPlaceholderText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 30,
  },

  // Estilos da tela de login seguindo o template
  loginContainer: {
    flex: 1,
    backgroundColor: '#282828',
    paddingHorizontal: 20,
    paddingTop: 60
  },
  loginHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60
  },
  headerSpacer: {
    flex: 1
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: '#00D4AA',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8
  },
  loginForm: {
    flex: 1
  },
  inputContainer: {
    marginBottom: 30,
    position: 'relative'
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  inputIconContainer: {
    marginRight: 15,
    paddingVertical: 15
  },
  inputIcon: {
    fontSize: 20,
    color: '#999'
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 15,
    paddingRight: 15,
    backgroundColor: 'transparent'
  },
  inputUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#00D4AA'
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: -20,
    marginBottom: 10
  },
  actionButton: {
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  switchModeContainer: {
    alignItems: 'center',
    marginTop: 30
  },
  switchModeText: {
    color: '#999',
    fontSize: 14
  },
  switchModeLink: {
    color: '#00D4AA',
    fontWeight: '500'
  },
  introSection: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#00D4AA',
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  introTitle: {
    color: '#00D4AA',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6
  },
  introText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
    marginBottom: 6
  },
  introItalic: {
    fontStyle: 'italic',
    color: '#00D4AA',
    fontWeight: 'bold'
  },
  introSubtext: {
    color: 'rgba(153, 153, 153, 0.7)',
    fontSize: 9,
    fontStyle: 'italic',
    textAlign: 'center'
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  userTypeText: {
    color: '#00D4AA',
    fontSize: 11,
    fontWeight: 'bold',
    marginRight: 8,
    backgroundColor: '#00D4AA20',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },

  // Estilos da tela de perfil
  profileCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00D4AA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  profileAvatarText: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold'
  },
  profileInfo: {
    flex: 1
  },
  profileName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5
  },
  profileEmail: {
    color: '#999',
    fontSize: 14
  },
  settingsSection: {
    marginBottom: 20
  },
  settingsTitle: {
    color: '#00D4AA',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  settingIconText: {
    fontSize: 18
  },
  settingContent: {
    flex: 1
  },
  settingLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2
  },
  settingDescription: {
    color: '#999',
    fontSize: 12
  },
  settingArrow: {
    color: '#999',
    fontSize: 20,
    fontWeight: 'bold'
  },
  appInfoSection: {
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20
  },
  appInfoTitle: {
    color: '#00D4AA',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15
  },
  appInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  appInfoLabel: {
    color: '#ccc',
    fontSize: 14
  },
  appInfoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500'
  },
  logoutButtonProfile: {
    backgroundColor: '#ff4444',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  },
  logoutButtonProfileText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },

  // Estilos do modal de edição de perfil
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginTop: 8
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5
  },
  cancelButton: {
    backgroundColor: '#666'
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  saveButton: {
    backgroundColor: '#00D4AA'
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
