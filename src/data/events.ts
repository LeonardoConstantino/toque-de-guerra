import { YardEvent } from '../types/game';

export const YARD_EVENTS_DATABASE: YardEvent[] = [
  {
    id: 'rookie_listener',
    title: 'O Novato do 6º Ano',
    character: 'Pedrinho do 6ºB',
    situation: 'Um novato tímido com um celular herdado do irmão mais velho se aproxima com os olhos brilhando: "Ei... aquele toque que você tocou antes foi incrível! Toca de novo pra eu aprender?"',
    choices: [
      {
        text: 'Mostrar o Toque com Orgulho',
        description: 'Toca sua melodia para o novato. Ele fica fascinado e espalha sua fama pelo corredor.',
        actionType: 'REPUTATION',
        value: 25,
        outcomeText: 'Pedrinho ficou maravilhado! Ele correu para a sala dos fundos gritando que você é o melhor compositor do colégio. (+25 Reputação, -2% Bateria)',
      },
      {
        text: 'Economizar Bateria ("Agora não, garoto")',
        description: 'Você guarda o aparelho no bolso discretamente para poupar carga.',
        actionType: 'SKIP',
        value: 0,
        outcomeText: 'Você poupou sua preciosa bateria. O recreio ainda é longo e os rivais estão à espreita.',
      },
    ],
  },
  {
    id: 'candy_wrapper_code',
    title: 'Papel de Bala Clandestino',
    character: 'Mensagem Anônima',
    situation: 'Você encontra um papel de chiclete dobrado em quatro dentro da fresta do armário de ferro. Dentro há uma sequência de teclas rabiscada a lápis...',
    choices: [
      {
        text: 'Decifrar e Anotar no Caderno',
        description: 'Adiciona a sequência lendária de Axel F / Super Mario às páginas do seu Caderno.',
        actionType: 'CODE',
        rewardCode: '8f2 8#g2 8f2 16f2 8#a2 8f2 8#d2',
        outcomeText: 'Você decifrou a anotação e guardou o código lendário no seu Caderno de Códigos! (+Nova página no Caderno)',
      },
      {
        text: 'Jogar Fora (Suspeito demais)',
        description: 'Pode ser uma pegadinha da diretoria.',
        actionType: 'SKIP',
        outcomeText: 'Você amassou o papel e seguiu seu caminho.',
      },
    ],
  },
  {
    id: 'yard_radio_broadcast',
    title: 'A Rádio do Pátio',
    character: 'Locutor do Recreio',
    situation: 'A caixinha de som amadora do grêmio está ligada na mesa de ping-pong. O DJ da escola acena: "Coloca o alto-falante do seu celular no microfone! Vamos tocar seu toque na transmissão do recreio!"',
    choices: [
      {
        text: 'Transmitir em Alta Frequência',
        description: 'Seu toque ecoa por todo o pátio, arquibancada e cantina.',
        actionType: 'RADIO',
        value: 35,
        outcomeText: 'O som monofônico explodiu na caixa de som! O colégio inteiro começou a cantarolar seu toque! (+35 Reputação, -3% Bateria)',
      },
      {
        text: 'Guardar Segredo para o Chefe',
        description: 'Não revele sua arma secreta antes da hora.',
        actionType: 'SKIP',
        outcomeText: 'Você manteve seu repertório em sigilo. Ninguém conhece sua estratégia para a batalha final.',
      },
    ],
  },
  {
    id: 'spare_battery_find',
    title: 'A Bateria Esquecida',
    character: 'Achados & Perdidos',
    situation: 'Atrás da pilastra do bebedouro, você avista um pequeno carregador caseiro ou uma bateria BL-5C sobressalente esquecida sobre uma folha de caderno!',
    choices: [
      {
        text: 'Fazer uma Carga Rápida',
        description: 'Conecta os polos com cuidado para dar uma sobrevida ao seu aparelho.',
        actionType: 'BATTERY',
        value: 20,
        outcomeText: 'Bzzzt! O indicador do celular subiu! Você ganhou fôlego para mais vários duelos! (+20% Bateria)',
      },
      {
        text: 'Deixar Onde Está (Pode ser cilada)',
        description: 'Melhor não mexer em fiação no meio do corredor.',
        actionType: 'SKIP',
        outcomeText: 'Você preferiu não arriscar.',
      },
    ],
  },
];
