type StatKey = 'charm' | 'cool' | 'sharp' | 'tough' | 'weird';

type MoveRef = {
  id: string;
  name: string;
  rollStat: StatKey;
  trigger: string;
  success: string;
  mixed: string;
  failure: string;
  subsections?: { title: string; success: string; mixed: string; failure?: string }[];
  extras?: { title: string; items: string[] }[];
  note?: string;
};

type WeaponTrait = { term: string; description: string };

const STAT_LABELS: Record<StatKey, string> = {
  charm: 'Charme',
  cool: 'Cool',
  sharp: 'Futé',
  tough: 'Coriace',
  weird: 'Bizarre',
};

const BASIC_MOVES: MoveRef[] = [
  {
    id: 'agir-sous-pression',
    name: 'Agir sous pression',
    rollStat: 'cool',
    trigger: "Quand vous agissez sous pression, lancez +Cool.",
    success: "Vous remplissez l'objectif que vous vous étiez fixé.",
    mixed: "Le Gardien choisit : l'issue n'est pas si rose, vous avez un choix difficile à faire, ou un prix à payer.",
    failure: "La situation dérape.",
  },
  {
    id: 'donner-coup-de-main',
    name: 'Donner un coup de main',
    rollStat: 'cool',
    trigger: "Vous pouvez aider un chasseur qui entreprend une manœuvre en lançant +Cool.",
    success: "Votre aide confère +1 à son jet.",
    mixed: "Votre aide confère +1 à son jet, mais vous vous retrouvez vous-même exposé.",
    failure: "Vous vous retrouvez exposé sans rien apporter à l'autre chasseur.",
  },
  {
    id: 'enqueter-mystere',
    name: 'Enquêter sur un mystère',
    rollStat: 'sharp',
    trigger: "Quand vous enquêtez sur un mystère, lancez +Futé.",
    success: "Réserve 2.",
    mixed: "Réserve 1.",
    failure: "Vous révélez des informations au monstre ou à l'individu. Le Gardien peut vous poser des questions auxquelles vous devez répondre.",
    extras: [
      {
        title: "Un point de réserve permet de poser une question :",
        items: [
          "Que s'est-il passé ici ?",
          "De quel genre de créature s'agit-il ?",
          "Que sait-elle faire ?",
          "À quoi est-elle vulnérable ?",
          "Où est-elle partie ?",
          "Que voulait-elle faire ?",
          "Y a-t-il quelque chose de caché par ici ?",
        ],
      },
    ],
  },
  {
    id: 'manipuler-quelquun',
    name: "Manipuler quelqu'un",
    rollStat: 'charm',
    trigger: "Après leur avoir donné une bonne raison, dites-leur ce que vous attendez d'eux, puis lancez +Charme.",
    success: "",
    mixed: "",
    failure: "",
    subsections: [
      {
        title: "Pour un individu normal",
        success: "Il le fera pour la raison que vous lui avez donnée. Si vous en demandez trop, il vous dira ce qu'il doit entreprendre pour y parvenir (ou qu'il en est incapable).",
        mixed: "Il obtempère, mais seulement si vous faites quelque chose sur-le-champ en échange. Si vous en demandez trop, il vous dira ce qu'il doit entreprendre pour y parvenir.",
        failure: "Votre approche est complètement ratée. La cible est offensée ou en colère.",
      },
      {
        title: "Pour un autre chasseur",
        success: "S'il fait ce que vous demandez, il gagne +1 temporaire.",
        mixed: "Il décide s'il fait ce que vous demandez.",
        failure: "Au chasseur de décider s'il est offensé ou agacé. Il coche de l'expérience s'il décide de ne pas faire ce que vous avez demandé.",
      },
      {
        title: "Pour les monstres et les sbires",
        success: "",
        mixed: "Cette manœuvre ne fonctionne normalement pas sur les monstres. Les sbires humains (ou presque humains) peuvent être manipulés. Les sbires incapables de comprendre ne peuvent pas l'être.",
      },
    ],
  },
  {
    id: 'proteger-quelquun',
    name: "Protéger quelqu'un",
    rollStat: 'tough',
    trigger: "Pour empêcher un personnage de subir des dégâts, lancez +Coriace.",
    success: "Vous protégez l'individu en question. Choisissez un effet : vous subissez moins de dégâts (−1 dégât) / c'est maintenant vous qui êtes en danger / vous infligez des dégâts à l'ennemi / vous tenez l'ennemi à distance.",
    mixed: "Vous protégez l'individu en question, mais subissez tout ou partie des dégâts à sa place.",
    failure: "La situation s'aggrave.",
  },
  {
    id: 'evaluer-situation',
    name: "Évaluer une situation qui craint",
    rollStat: 'sharp',
    trigger: "Quand vous observez les environs et évaluez une situation qui craint, lancez +Futé.",
    success: "Réserve 3.",
    mixed: "Réserve 1.",
    failure: "Vous méjugez la situation ou dévoilez des détails tactiques à vos ennemis.",
    extras: [
      {
        title: "Un point de réserve peut être dépensé pour poser une question (gagnez +1 constant sur les actions conformes) :",
        items: [
          "Quelle est la meilleure façon d'entrer pour moi ?",
          "Quelle est la meilleure façon de sortir pour moi ?",
          "Y a-t-il des dangers que nous n'avons pas remarqués ?",
          "Quelle est la plus grande menace ?",
          "Qu'est-ce qui est le plus vulnérable selon moi ?",
          "Quelle est la meilleure façon de protéger les victimes ?",
        ],
      },
    ],
  },
  {
    id: 'utiliser-magie',
    name: 'Utiliser la magie',
    rollStat: 'weird',
    trigger: "Quand vous utilisez la magie, détaillez ce que vous voulez faire et comment vous comptez y parvenir, puis lancez +Bizarre.",
    note: "Par défaut, la magie dure une trentaine de minutes.",
    success: "La magie fonctionne comme prévu. Choisissez l'effet.",
    mixed: "Elle ne fonctionne pas totalement comme prévu. Choisissez l'effet et un pépin. Au Gardien de déterminer la nature de ce pépin.",
    failure: "Vous perdez le contrôle de la magie et ça finit mal.",
    extras: [
      {
        title: "Effets :",
        items: [
          "Infliger des dégâts (1 dégât, ignore l'armure, magique, évident).",
          "Enchanter une arme (+1 dégât, magique).",
          "Faire une chose qui dépasse les limites humaines.",
          "Barrer un lieu ou une porte pour un individu ou un type de créature précis.",
          "Piéger un individu, sbire ou monstre précis.",
          "Bannir un esprit ou lever une malédiction affectant un individu, un objet ou un lieu.",
          "Invoquer un monstre.",
          "Communiquer avec quelqu'un ou quelque chose dont vous ne connaissez pas la langue.",
          "Observer un autre lieu ou temps.",
          "Éliminer 1 dégât, soigner une maladie ou neutraliser un poison.",
        ],
      },
      {
        title: "Pépins :",
        items: [
          "L'effet est amoindri.",
          "L'effet est raccourci.",
          "Vous subissez 1 dégât (ignore l'armure).",
          "La magie attire l'attention.",
          "Elle produit un effet secondaire fâcheux.",
        ],
      },
      {
        title: "Le Gardien peut exiger :",
        items: [
          "Le sort nécessite des composantes exotiques.",
          "Le temps d'incantation est de 10 secondes, 30 secondes ou 1 minute.",
          "L'incantation s'accompagne de chants et de gestes rituels.",
          "L'incantation s'accompagne de symboles ésotériques à tracer.",
          "Vous avez besoin d'une personne ou deux pour vous aider.",
          "Vous devez vous tourner vers un grimoire pour certains détails.",
        ],
      },
    ],
  },
  {
    id: 'casser-la-gueule',
    name: 'Casser la gueule',
    rollStat: 'tough',
    trigger: "Quand vous êtes mêlé(e) à un combat et cassez des gueules, lancez +Coriace.",
    success: "Vous infligez les dégâts de votre arme. Choisissez un effet supplémentaire : gagnez +1 temporaire ou donnez +1 temporaire à un autre chasseur / vous infligez des dégâts considérables (+1 dégât) / vous subissez moins de dégâts (−1 dégât) / vous le poussez où vous le voulez.",
    mixed: "Vous et ce que vous combattez vous infligez mutuellement des dégâts.",
    failure: "Vous prenez une raclée. Vous subissez des dégâts ou êtes capturé(e), mais vous n'infligez pas de dégâts.",
  },
];

const WEAPON_RANGE: WeaponTrait[] = [
  { term: 'personnel', description: "efficace au corps-à-corps, y compris en cas d'étreinte." },
  { term: 'allonge', description: "efficace à portée d'allonge." },
  { term: 'proche', description: "efficace à portée courte, au-delà de la simple allonge mais pas trop loin." },
  { term: 'loin', description: "efficace à portée longue." },
];

const WEAPON_OTHER_TRAITS: WeaponTrait[] = [
  { term: 'béni', description: "plus efficace contre les monstres vulnérables aux objets bénis." },
  { term: 'bruyant', description: "assez bruyant pour attirer l'attention." },
  { term: 'feu', description: "met le feu." },
  { term: "ignore l'armure", description: "ignore les armures. Si l'armure a le trait magique, l'attaque doit aussi être magique." },
  { term: 'inoffensif', description: "ne suscite pas la méfiance." },
  { term: 'lent', description: "demande un minimum de préparation." },
  { term: 'lourd', description: "lourde et son maniement est difficile." },
  { term: 'magique', description: "peut affecter certaines créatures et armures à l'épreuve des armes normales." },
  { term: '[matériau]', description: "faite du matériau indiqué — utile contre les monstres l'ayant pour faiblesse." },
  { term: 'multiple', description: "assez petite pour en porter un grand nombre." },
  { term: 'petit', description: "minuscule et aisément dissimulable." },
  { term: 'rechargement', description: "munitions limitées, vous pouvez être amené(e) à devoir la recharger." },
  { term: 'sanglant', description: "arrose les environs de sang." },
  { term: 'utile', description: "n'est pas uniquement conçue pour se battre." },
  { term: 'volatile', description: "dangereuse et instable." },
  { term: 'zone', description: "peut toucher plusieurs adversaires. Vous pouvez diviser les dégâts entre plusieurs cibles." },
];

function StatBadge({ stat }: { stat: StatKey }) {
  return (
    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-bold border border-orange-200 bg-orange-100 text-orange-700">
      +{STAT_LABELS[stat]}
    </span>
  );
}

function ResultRow({ label, text, tone }: { label: string; text: string; tone: 'success' | 'mixed' | 'failure' }) {
  const colors = { success: 'text-green-600', mixed: 'text-yellow-600', failure: 'text-red-600' };
  if (!text) return null;
  return (
    <div className="flex gap-2 text-sm leading-relaxed">
      <span className={`shrink-0 font-bold ${colors[tone]}`}>{label}</span>
      <span className="text-stone-700">{text}</span>
    </div>
  );
}

function MoveSection({ move }: { move: MoveRef }) {
  return (
    <div className="space-y-2 rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-bold text-ink">{move.name}</h3>
        <StatBadge stat={move.rollStat} />
      </div>
      <p className="text-sm italic text-stone-500">{move.trigger}</p>
      {move.note && <p className="text-xs text-stone-400">{move.note}</p>}

      {move.subsections ? (
        <div className="space-y-3">
          {move.subsections.map((sub) => (
            <div key={sub.title} className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-400">{sub.title}</p>
              <ResultRow label="10+" text={sub.success} tone="success" />
              <ResultRow label="7-9" text={sub.mixed} tone="mixed" />
              {sub.failure && <ResultRow label="Échec" text={sub.failure} tone="failure" />}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          <ResultRow label="10+" text={move.success} tone="success" />
          <ResultRow label="7-9" text={move.mixed} tone="mixed" />
          <ResultRow label="Échec" text={move.failure} tone="failure" />
        </div>
      )}

      {move.extras?.map((extra) => (
        <div key={extra.title} className="space-y-1 pt-1">
          <p className="text-xs font-bold text-stone-500">{extra.title}</p>
          <ul className="list-inside list-disc space-y-0.5">
            {extra.items.map((item) => (
              <li key={item} className="text-xs text-stone-600">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function HunterReference() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
        <h3 className="mb-2 font-bold text-ink">Quand vous jouez votre chasseur</h3>
        <ul className="list-inside list-disc space-y-1">
          {[
            "Agissez comme si vous étiez le héros de l'histoire (parce que c'est le cas).",
            "Tracez votre propre voie.",
            "Trouvez ces foutus monstres et arrêtez-les.",
            "Mettez-vous dans la peau de votre chasseur.",
          ].map((tip) => (
            <li key={tip} className="text-sm text-stone-700">
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-bold text-ink">Les manœuvres de base</h3>
        {BASIC_MOVES.map((move) => (
          <MoveSection key={move.id} move={move} />
        ))}
      </section>

      <section className="space-y-4 rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
        <h3 className="font-bold text-ink">Armes</h3>

        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-stone-400">Dégâts</p>
          <p className="text-sm text-stone-700">
            <strong className="text-ink">1 dégât, 2 dégâts, 3 dégâts…</strong>{" "}
            la quantité de dégâts que l&apos;attaque inflige.
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-stone-400">Portée</p>
          <div className="space-y-1">
            {WEAPON_RANGE.map(({ term, description }) => (
              <p key={term} className="text-sm text-stone-700">
                <strong className="text-ink">{term}</strong> : {description}
              </p>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-stone-400">Autres traits</p>
          <div className="space-y-1">
            {WEAPON_OTHER_TRAITS.map(({ term, description }) => (
              <p key={term} className="text-sm text-stone-700">
                <strong className="text-ink">{term}</strong> : {description}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-1 rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
        <h3 className="mb-2 font-bold text-ink">Dégâts</h3>
        {[
          "L'armure diminue la quantité de dégâts subis. Si vos protections réduisent les blessures à 0 dégât, vous ne cochez pas de case.",
          "Une fois que 4 cases sont cochées, vos blessures deviennent instables. Cochez la case « Instable ».",
          "8 dégâts suffisent à tuer un humain normal, y compris un Chasseur.",
          "Tous les monstres (et certains sbires) ont des faiblesses. Vous ne pouvez les tuer que si vous les exploitez.",
        ].map((rule) => (
          <p key={rule} className="text-sm text-stone-700">
            • {rule}
          </p>
        ))}
      </section>

      <section className="space-y-1 rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
        <h3 className="mb-2 font-bold text-ink">Soins</h3>
        {[
          "Une blessure à 0 dégât disparaît tout de suite.",
          "Blessures légères (1-3 dégâts) : se résorbent au repos ou aux premiers soins — élimine 1 dégât automatiquement.",
          "Blessures graves (4+ dégâts) : nécessitent une infirmerie, un hôpital ou des soins magiques.",
          "Blessures instables : s'aggravent si elles ne sont pas prises en charge.",
        ].map((rule) => (
          <p key={rule} className="text-sm text-stone-700">
            • {rule}
          </p>
        ))}
      </section>

      <section className="space-y-1 rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
        <h3 className="mb-2 font-bold text-ink">La Chance</h3>
        <p className="text-sm text-stone-700">Quand vous cochez une case de Chance, choisissez :</p>
        {[
          "Diminuez une blessure que vous venez de subir à 0 dégât.",
          "Passez le résultat d'un jet de dés que vous venez d'effectuer à 12.",
        ].map((option) => (
          <p key={option} className="text-sm text-stone-700">
            • {option}
          </p>
        ))}
        <p className="mt-2 text-sm italic text-stone-500">
          Quand toutes les cases de Chance sont cochées, le Gardien peut se lâcher.
        </p>
      </section>
    </div>
  );
}
