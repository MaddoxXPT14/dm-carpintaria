import { works } from "@/lib/site";
import type { GalleryProject } from "@/lib/gallery";

export type CopyService = {
  title: string;
  summary: string;
  benefits: string[];
};

export type CopyStep = { n: string; title: string; text: string };
export type CopyFaq = { q: string; a: string };

export type SiteCopy = {
  heroKicker: string;
  heroTitle: string;
  heroText: string;
  heroPrimary: string;
  heroSecondary: string;
  heroNotes: string[];
  heroBadge: string;
  aboutKicker: string;
  aboutTitle: string;
  aboutP1: string;
  aboutP2: string;
  mission: string;
  vision: string;
  values: string;
  steps: CopyStep[];
  servicesKicker: string;
  servicesTitle: string;
  servicesIntro: string;
  services: CopyService[];
  testimonialsKicker: string;
  testimonialsTitle: string;
  quote: string;
  quoteBy: string;
  testimonialsNote: string;
  promisesTitle: string;
  promises: string[];
  faqKicker: string;
  faqTitle: string;
  faqIntro: string;
  faqs: CopyFaq[];
  galleryKicker: string;
  galleryTitle: string;
  galleryText: string;
  galleryButton: string;
  trabalhosTitle: string;
  trabalhosText: string;
  contactKicker: string;
  contactTitle: string;
  contactText: string;
  footerText: string;
  phone: string;
  email: string;
  address: string;
  facebook: string;
  instagram: string;
};

export const defaultCopy: SiteCopy = {
  heroKicker: "Carpintaria de interiores",
  heroTitle: "Madeira à medida da sua casa.",
  heroText:
    "Painéis ripados, mobiliário e divisões feitas para o espaço real. Do desenho à montagem, com um orçamento que se percebe.",
  heroPrimary: "Pedir orçamento",
  heroSecondary: "Contactar",
  heroNotes: ["Medição no local", "Orçamento sem compromisso", "Montagem incluída"],
  heroBadge: "Painel ripado em carvalho",
  aboutKicker: "Sobre nós",
  aboutTitle: "Quem mede é quem monta.",
  aboutP1:
    "A DM Carpintaria faz interiores em madeira: paredes de televisão, móveis integrados, cozinhas, roupeiros e portas. O trabalho que publicamos — uma base de TV com painel ripado em carvalho — resume o ofício: uma peça desenhada para aquela parede, não adaptada de um catálogo.",
  aboutP2: "Fala diretamente com quem executa. Sem balcão pelo meio, do primeiro contacto ao dia da montagem.",
  mission: "Entregar carpintaria bem feita, com materiais honestos e um resultado que se reconhece no dia da montagem.",
  vision: "Ser a oficina a que se volta quando a casa pede o que o catálogo não tem.",
  values: "Rigor nas medidas, clareza no preço, respeito pela madeira e cuidado dentro de casa.",
  steps: [
    { n: "01", title: "Conversamos", text: "Diz-nos a divisão, a medida aproximada e o que quer resolver." },
    { n: "02", title: "Medimos no local", text: "A visita confirma paredes, tomadas, portas e o que o catálogo ignora." },
    { n: "03", title: "Orçamento claro", text: "Recebe uma proposta percebida, sem letras pequenas de surpresa." },
    { n: "04", title: "Fabrico e montagem", text: "A peça nasce na oficina e fica pronta em sua casa." },
  ],
  servicesKicker: "Serviços",
  servicesTitle: "O que a madeira pode fazer numa casa.",
  servicesIntro: "Cada serviço inclui conversa, medição e montagem. O desenho segue o espaço, não uma medida de exposição.",
  services: [
    {
      title: "Painéis ripados e paredes de TV",
      summary: "A televisão deixa de ficar pendurada numa parede vazia. O painel integra o ecrã, esconde cabos e dá ritmo à sala.",
      benefits: ["Cabos fora de vista", "À medida do ecrã e do móvel", "Carvalho e outras madeiras"],
    },
    {
      title: "Mobiliário à medida",
      summary: "Estantes, secretárias, cabeceiras e aparadores desenhados para a parede que já existe — não o contrário.",
      benefits: ["Medidas do espaço real", "Arrumação onde faz falta", "Acabamento combinado consigo"],
    },
    {
      title: "Cozinhas",
      summary: "Frentes, ilhas e despensas pensadas para o uso diário. Madeira onde se vê, resistência onde se trabalha.",
      benefits: ["Projeto alinhado com a obra", "Ferragens escolhidas consigo", "Montagem no local"],
    },
    {
      title: "Roupeiros e closets",
      summary: "Portas à face, interiores com luz e prateleiras na altura certa. O quarto fica mais calmo e a roupa, arrumada.",
      benefits: ["Interior desenhado consigo", "Portas que não batem no espaço", "Acabamento uniforme"],
    },
    {
      title: "Portas e aros",
      summary: "Portas de interior em madeira, com aro, sombra e puxador escolhidos para fechar a divisão com critério.",
      benefits: ["Madeira maciça ou folheada", "Aro alinhado com o pavimento", "Pormenor de puxador"],
    },
    {
      title: "Revestimentos e ripados",
      summary: "Paredes, lambris e pormenores que ligam as divisões. A mesma linguagem de madeira em toda a casa.",
      benefits: ["Continuidade entre divisões", "Proteção da parede", "Leitura mais quente do espaço"],
    },
  ],
  testimonialsKicker: "Testemunhos",
  testimonialsTitle: "O que já foi dito em público.",
  quote: "Top!",
  quoteBy: "Pedro Carvalho, comentário público no Facebook, sobre a base de TV com painel ripado em carvalho.",
  testimonialsNote:
    "A página ainda não tem avaliações formais com classificação. Se já fomos a sua casa, a sua opinião no Facebook ajuda quem está a decidir.",
  promisesTitle: "Cinco pontos que não negociamos.",
  promises: [
    "Medição no local antes de cortar",
    "Materiais combinados consigo",
    "Orçamento sem compromisso",
    "Montagem incluída",
    "A casa fica apresentável no fim",
  ],
  faqKicker: "Perguntas frequentes",
  faqTitle: "Antes de ligar.",
  faqIntro: "Se a sua dúvida não estiver aqui, o WhatsApp é o caminho mais curto.",
  faqs: [
    {
      q: "Como peço um orçamento?",
      a: "Pelo formulário, pelo WhatsApp ou por telefone. Chega uma descrição da divisão, duas fotos e, se tiver, as medidas. Respondemos para marcar a visita ou avançar com uma primeira leitura.",
    },
    {
      q: "O orçamento tem custo?",
      a: "Não. A proposta é sem compromisso. Se for precisa uma visita para medir, combinamos o dia consigo.",
    },
    {
      q: "Deslocam-se a casa?",
      a: "Sim. O trabalho é medido e montado no local da obra. Indique a zona no pedido para organizarmos a deslocação.",
    },
    {
      q: "Que madeiras trabalham?",
      a: "O carvalho é a madeira que mais mostramos — painéis ripados e bases de televisão. Consoante o projeto, também trabalhamos outras madeiras, folheados e lacados.",
    },
    {
      q: "Quanto tempo demora uma peça?",
      a: "Depende da complexidade e da fila da oficina. No orçamento indicamos um prazo realista de fabrico e o dia previsto de montagem — sem prometer o que a obra não permite.",
    },
    {
      q: "Trabalham com projeto de arquiteto?",
      a: "Sim. Executamos desenhos existentes ou propomos a solução a partir do espaço. Em qualquer dos casos, as medidas finais são confirmadas no local.",
    },
    {
      q: "Fazem só a montagem?",
      a: "O nosso trabalho habitual é desenho, fabrico e montagem. Se já tiver as peças e precisar apenas de instalação, diga-nos o que está em causa e avaliamos.",
    },
  ],
  galleryKicker: "Trabalhos",
  galleryTitle: "Trabalho já feito.",
  galleryText: "A galeria junta as fotografias de cada obra. Entra para ver o conjunto.",
  galleryButton: "Ver a galeria",
  trabalhosTitle: "Trabalhos já feitos.",
  trabalhosText: "Cada ficha é um trabalho. As fotografias do mesmo trabalho ficam juntas.",
  contactKicker: "Contactos",
  contactTitle: "Conte-nos a divisão. Nós tratamos da madeira.",
  contactText:
    "O pedido abre uma conversa no WhatsApp, para respondermos no mesmo sítio onde já falamos com clientes. Não guardamos os dados neste site.",
  footerText: "Interiores em madeira à medida.",
  phone: "+351 911 829 220",
  email: "davidmarcal23@hotmail.com",
  address: "",
  facebook: "https://www.facebook.com/profile.php?id=61593776961711",
  instagram: "",
};

export function defaultProjects(): GalleryProject[] {
  let nextId = 1;
  return works.map((work) => {
    const id = nextId;
    nextId += 1;
    return {
      id,
      title: work.title,
      tag: work.tag,
      body: work.text,
      photos: work.images.map((image) => {
        const photoId = nextId;
        nextId += 1;
        return { id: photoId, alt: image.alt, src: image.src };
      }),
    };
  });
}

export function telHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `+${digits}`;
}

export function waNumber(phone: string) {
  return phone.replace(/\D/g, "");
}
