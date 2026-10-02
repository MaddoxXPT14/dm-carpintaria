import {
  Columns3,
  CookingPot,
  DoorClosed,
  DoorOpen,
  Layers,
  Sofa,
  type LucideIcon,
} from "lucide-react";

export const site = {
  name: "DM Carpintaria",
  description:
    "Carpintaria de interiores à medida. Painéis ripados em carvalho, mobiliário, cozinhas, roupeiros e portas. Orçamento claro e montagem no local.",
  phoneDisplay: "+351 911 829 220",
  phoneTel: "+351911829220",
  whatsapp: "351911829220",
  email: "davidmarcal23@hotmail.com",
  facebook: "https://www.facebook.com/profile.php?id=61593776961711",
  instagram: "",
  /** Cole o ID G-XXXXXXXX do Google Analytics. Vazio = não carrega o script. */
  analyticsId: "",
  /** Morada pública, quando existir. Ex.: "Rua Exemplo 1, 0000-000 Cidade". */
  address: "",
};

export const nav = [
  { href: "/#sobre", label: "Sobre" },
  { href: "/#servicos", label: "Serviços" },
  { href: "/trabalhos", label: "Trabalhos" },
  { href: "/#testemunhos", label: "Testemunhos" },
  { href: "/#faq", label: "Perguntas" },
  { href: "/#contactos", label: "Contactos" },
];

export type Service = {
  title: string;
  summary: string;
  benefits: string[];
  icon: LucideIcon;
};

export const services: Service[] = [
  {
    title: "Painéis ripados e paredes de TV",
    summary:
      "A televisão deixa de ficar pendurada numa parede vazia. O painel integra o ecrã, esconde cabos e dá ritmo à sala.",
    benefits: ["Cabos fora de vista", "À medida do ecrã e do móvel", "Carvalho e outras madeiras"],
    icon: Columns3,
  },
  {
    title: "Mobiliário à medida",
    summary:
      "Estantes, secretárias, cabeceiras e aparadores desenhados para a parede que já existe — não o contrário.",
    benefits: ["Medidas do espaço real", "Arrumação onde faz falta", "Acabamento combinado consigo"],
    icon: Sofa,
  },
  {
    title: "Cozinhas",
    summary:
      "Frentes, ilhas e despensas pensadas para o uso diário. Madeira onde se vê, resistência onde se trabalha.",
    benefits: ["Projeto alinhado com a obra", "Ferragens escolhidas consigo", "Montagem no local"],
    icon: CookingPot,
  },
  {
    title: "Roupeiros e closets",
    summary:
      "Portas à face, interiores com luz e prateleiras na altura certa. O quarto fica mais calmo e a roupa, arrumada.",
    benefits: ["Interior desenhado consigo", "Portas que não batem no espaço", "Acabamento uniforme"],
    icon: DoorClosed,
  },
  {
    title: "Portas e aros",
    summary:
      "Portas de interior em madeira, com aro, sombra e puxador escolhidos para fechar a divisão com critério.",
    benefits: ["Madeira maciça ou folheada", "Aro alinhado com o pavimento", "Pormenor de puxador"],
    icon: DoorOpen,
  },
  {
    title: "Revestimentos e ripados",
    summary:
      "Paredes, lambris e pormenores que ligam as divisões. A mesma linguagem de madeira em toda a casa.",
    benefits: ["Continuidade entre divisões", "Proteção da parede", "Leitura mais quente do espaço"],
    icon: Layers,
  },
];

export const works = [
  {
    title: "Base de TV e painel ripado em carvalho",
    tag: "Sala",
    text: "Base TV com painel para televisão e painel ripado em carvalho. Uma visão única.",
    images: [
      { src: "/gallery/fb/obras/122114468-1.jpg", alt: "Televisão, móvel baixo, sala de estar" },
      { src: "/gallery/fb/obras/122114468-2.jpg", alt: "Televisão, móvel baixo, interior e sala de estar" },
      { src: "/gallery/fb/obras/122114468-3.jpg", alt: "Televisão, sala de estar" },
    ],
  },
  {
    title: "Quarto com cama e porta de correr",
    tag: "Quarto",
    text: "Cama, portas de correr e porta de celeiro no mesmo quarto.",
    images: [
      { src: "/gallery/fb/obras/122110434-1.jpg", alt: "Quarto" },
      { src: "/gallery/fb/obras/122110434-2.jpg", alt: "Cama, interior e quarto" },
      { src: "/gallery/fb/obras/122110434-3.jpg", alt: "Porta de correr, interior, porta de celeiro e quarto" },
      { src: "/gallery/fb/obras/122110434-4.jpg", alt: "Interior e quarto" },
      { src: "/gallery/fb/obras/122110434-5.jpg", alt: "Quarto, porta de correr" },
    ],
  },
  {
    title: "Cozinha com ilha e exaustor",
    tag: "Cozinha",
    text: "Ilha, exaustor e porta de correr.",
    images: [
      { src: "/gallery/fb/obras/122109608-1.jpg", alt: "Exaustor, interior e porta de correr" },
      { src: "/gallery/fb/obras/122109608-2.jpg", alt: "Exaustor, ilha de cozinha, interior e porta de correr" },
      { src: "/gallery/fb/obras/122109608-3.jpg", alt: "Interior" },
      { src: "/gallery/fb/obras/122109608-4.jpg", alt: "Exaustor, ilha de cozinha" },
    ],
  },
  {
    title: "Móvel e portas de correr",
    tag: "Interior",
    text: "Móvel baixo e portas de correr.",
    images: [
      { src: "/gallery/fb/obras/122109606-1.jpg", alt: "Móvel baixo, porta de correr" },
      { src: "/gallery/fb/obras/122109606-2.jpg", alt: "Interior" },
      { src: "/gallery/fb/obras/122109606-3.jpg", alt: "Interior e porta de correr" },
      { src: "/gallery/fb/obras/122109606-4.jpg", alt: "Móvel baixo" },
    ],
  },
  {
    title: "Cozinha com exaustor e portas",
    tag: "Cozinha",
    text: "Exaustor, pia, portas de correr e porta de celeiro.",
    images: [
      { src: "/gallery/fb/obras/122109499-1.jpg", alt: "Móvel baixo, interior e porta de correr" },
      { src: "/gallery/fb/obras/122109499-2.jpg", alt: "Exaustor, interior, porta de correr, porta de celeiro e braseiro" },
      { src: "/gallery/fb/obras/122109499-3.jpg", alt: "Interior e porta de correr" },
      { src: "/gallery/fb/obras/122109499-4.jpg", alt: "Porta de correr" },
      { src: "/gallery/fb/obras/122109499-5.jpg", alt: "Pia" },
    ],
  },
  {
    title: "Quarto, portas e lavandaria",
    tag: "Interior",
    text: "Quarto com portas de correr, iluminação, móvel, pias e lavandaria.",
    images: [
      { src: "/gallery/fb/obras/122109288-1.jpg", alt: "Interior, quarto e porta de correr" },
      { src: "/gallery/fb/obras/122109288-2.jpg", alt: "Porta de correr, interior e quarto" },
      { src: "/gallery/fb/obras/122109288-3.jpg", alt: "Interior" },
      { src: "/gallery/fb/obras/122109288-4.jpg", alt: "Iluminação" },
      { src: "/gallery/fb/obras/122109288-5.jpg", alt: "Móvel baixo" },
      { src: "/gallery/fb/obras/122109288-6.jpg", alt: "Pia" },
      { src: "/gallery/fb/obras/122109288-7.jpg", alt: "Pia" },
      { src: "/gallery/fb/obras/122109288-8.jpg", alt: "Pia" },
      { src: "/gallery/fb/obras/122109288-9.jpg", alt: "Lavandaria" },
    ],
  },
  {
    title: "Coluna e móvel",
    tag: "Pormenor",
    text: "Coluna e móvel baixo.",
    images: [
      { src: "/gallery/fb/obras/122109264-1.jpg", alt: "Coluna" },
      { src: "/gallery/fb/obras/122109264-2.jpg", alt: "Móvel baixo, interior e texto" },
    ],
  },
  {
    title: "Móveis e colunas",
    tag: "Interior",
    text: "Móveis baixos, colunas e pormenores do interior.",
    images: [
      { src: "/gallery/fb/obras/122109263-1.jpg", alt: "Móvel baixo" },
      { src: "/gallery/fb/obras/122109263-2.jpg", alt: "Móvel baixo" },
      { src: "/gallery/fb/obras/122109263-3.jpg", alt: "Interior e texto" },
      { src: "/gallery/fb/obras/122109263-4.jpg", alt: "Coluna" },
      { src: "/gallery/fb/obras/122109263-5.jpg", alt: "Coluna" },
    ],
  },
  {
    title: "Móvel, pia e portas",
    tag: "Interior",
    text: "Móvel, iluminação, pia e portas de correr.",
    images: [
      { src: "/gallery/fb/obras/122109262-1.jpg", alt: "Móvel baixo, iluminação, pia" },
      { src: "/gallery/fb/obras/122109262-2.jpg", alt: "Interior" },
      { src: "/gallery/fb/obras/122109262-3.jpg", alt: "Móvel baixo, porta de correr" },
      { src: "/gallery/fb/obras/122109262-4.jpg", alt: "Fotografia do trabalho" },
      { src: "/gallery/fb/obras/122109262-5.jpg", alt: "Pia, interior e porta de correr" },
    ],
  },
  {
    title: "Móvel, pia e iluminação",
    tag: "Interior",
    text: "Móvel, pia, iluminação e portas de correr.",
    images: [
      { src: "/gallery/fb/obras/122109261-1.jpg", alt: "Letreiro no espaço" },
      { src: "/gallery/fb/obras/122109261-2.jpg", alt: "Fotografia do trabalho" },
      { src: "/gallery/fb/obras/122109261-3.jpg", alt: "Pia, porta de correr" },
      { src: "/gallery/fb/obras/122109261-4.jpg", alt: "Móvel baixo, sala de estar, interior e texto" },
      { src: "/gallery/fb/obras/122109261-5.jpg", alt: "Interior" },
      { src: "/gallery/fb/obras/122109261-6.jpg", alt: "Pia, iluminação" },
      { src: "/gallery/fb/obras/122109261-7.jpg", alt: "Iluminação, porta de correr" },
    ],
  },
  {
    title: "Cozinha, quarto e portas",
    tag: "Obra",
    text: "Ilha de cozinha, mesa, quarto, portas e iluminação.",
    images: [
      { src: "/gallery/fb/obras/122109238-1.jpg", alt: "Ilha de cozinha, mesa" },
      { src: "/gallery/fb/obras/122109238-2.jpg", alt: "Porta de correr" },
      { src: "/gallery/fb/obras/122109238-3.jpg", alt: "Iluminação" },
      { src: "/gallery/fb/obras/122109238-4.jpg", alt: "Porta de celeiro, porta de correr" },
      { src: "/gallery/fb/obras/122109238-5.jpg", alt: "Interior" },
      { src: "/gallery/fb/obras/122109238-6.jpg", alt: "Iluminação" },
      { src: "/gallery/fb/obras/122109238-7.jpg", alt: "Iluminação, interior e quarto" },
      { src: "/gallery/fb/obras/122109238-8.jpg", alt: "Móvel baixo, pia" },
      { src: "/gallery/fb/obras/122109238-9.jpg", alt: "Interior" },
    ],
  },
];

export const steps = [
  { n: "01", title: "Conversamos", text: "Diz-nos a divisão, a medida aproximada e o que quer resolver." },
  { n: "02", title: "Medimos no local", text: "A visita confirma paredes, tomadas, portas e o que o catálogo ignora." },
  { n: "03", title: "Orçamento claro", text: "Recebe uma proposta percebida, sem letras pequenas de surpresa." },
  { n: "04", title: "Fabrico e montagem", text: "A peça nasce na oficina e fica pronta em sua casa." },
];

export const promises = [
  "Medição no local antes de cortar",
  "Materiais combinados consigo",
  "Orçamento sem compromisso",
  "Montagem incluída",
  "A casa fica apresentável no fim",
];

export const faqs = [
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
];

export function whatsappHref(text: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}

export const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HomeAndConstructionBusiness",
      name: site.name,
      description: site.description,
      telephone: site.phoneTel,
      email: site.email,
      url: site.facebook,
      areaServed: { "@type": "Country", name: "Portugal" },
      sameAs: [site.facebook],
      knowsLanguage: "pt-PT",
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};
