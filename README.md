# Music App - Planner Musical

Uma aplicação web para gerenciamento de músicas e partituras, construída com React e Firebase.

## 🚀 Funcionalidades

- Autenticação de usuários (login/cadastro)
- Gerenciamento de músicas (adicionar, editar, excluir)
- Visualização e impressão de partituras
- Sistema de notificações
- Interface moderna e responsiva
- Validação de formulários
- Feedback visual para ações do usuário
- Tratamento de erros

## 🛠️ Tecnologias Utilizadas

- React 18
- Firebase (Auth e Firestore)
- Styled Components
- React Router Dom
- React Loading
- React Toastify
- React Icons
- PropTypes
- ESLint e Prettier para qualidade de código

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- NPM ou Yarn
- Conta no Firebase

## 🔧 Configuração

1. Clone o repositório:
```bash
git clone https://github.com/Jspedrosoctba/PlannerMusica.git
cd music-app
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione suas configurações do Firebase:
```env
REACT_APP_FIREBASE_API_KEY=seu_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=seu_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=seu_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=seu_app_id
```

4. Inicie o servidor de desenvolvimento:
```bash
npm start
# ou
yarn start
```

## 📦 Estrutura do Projeto

```
src/
  ├── components/     # Componentes React
  ├── contexts/       # Contextos React (Auth, Notificações)
  ├── utils/          # Funções utilitárias
  ├── firebaseConfig.js  # Configuração do Firebase
  └── App.js         # Componente principal
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
