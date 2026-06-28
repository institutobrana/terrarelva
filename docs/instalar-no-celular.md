# Instalar a Terra Relva no celular

## Jeito mais simples agora

1. No computador, abra o PowerShell na pasta do app:

```powershell
cd "D:\TERRA RELVA APP"
python -m http.server 8080 -d www
```

2. No celular, abra o navegador no mesmo Wi-Fi:

```text
http://192.168.3.41:8080
```

3. Quando abrir:

- se aparecer o botao `Instalar no celular`, toque nele
- se nao aparecer, abra o menu do navegador e escolha `Adicionar a tela inicial`

Depois disso, o app fica com icone proprio na tela do celular.

## Importante

- nesse modo, para abrir e sincronizar usando esse endereco local, o computador precisa estar ligado na mesma rede
- a vantagem e que ja da para testar o app como se fosse instalado

## Situacao atual

- O frontend oficial do projeto agora e `frontend-react/`.
- O backend oficial agora e `backend/`.
- A pasta `www/` permanece apenas como base temporaria de empacotamento mobile legado.

## Proxima etapa para virar APK

Arquivos prontos:

- `package.json`
- `capacitor.config.json`

Para gerar APK depois, vamos precisar instalar:

1. Node
2. Java JDK
3. Android Studio

Depois rodaremos:

```powershell
npm.cmd install
npx cap add android
npx cap sync android
npx cap open android
```

No Android Studio, sera possivel gerar o APK e instalar direto no celular da Flavia.

Antes de apontar o mobile para o React oficial, ainda sera preciso revisar a troca do `webDir` legado para o build correto do novo frontend.
