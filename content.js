/* Contenido: niveles, lecciones con quiz, glosario, estrategias, tips y checklist. */
(function (root) {
  'use strict';

  var levels = [
    { id: 'basico', n: 1, name: 'Básico', desc: 'Qué es operar, cómo leer un gráfico y cómo cuidar el capital.' },
    { id: 'intermedio', n: 2, name: 'Intermedio', desc: 'Indicadores, patrones, multi-timeframe y tus primeras estrategias.' },
    { id: 'avanzado', n: 3, name: 'Avanzado', desc: 'Estadística, backtesting serio, macro y paso a automatizar.' }
  ];

  var lessons = [

    /* ============ BÁSICO ============ */
    {
      id: 'b1', level: 'basico', title: 'Qué es el trading', mins: 5,
      blocks: [
        ['p', 'Tradear es comprar y vender un activo buscando ganar con la diferencia de precio. Si comprás a $100 y vendés a $108, ganaste $8 por unidad. Según el instrumento y el bróker, también se puede ganar cuando el precio baja: vendés primero (venta en corto) y recomprás más barato.'],
        ['h', 'Trading e inversión'],
        ['ul', [
          '**Inversión:** horizonte de años. Se mira el valor de fondo del activo: balances, dividendos, crecimiento.',
          '**Trading:** horizonte de minutos a meses. Se mira el movimiento del precio y se controla el riesgo operación por operación.'
        ]],
        ['h', 'Estilos según el tiempo que dura la operación'],
        ['table', [
          ['Estilo', 'Gráfico de entrada', 'Duración típica'],
          ['Scalping', '1M, 5M', 'Segundos a minutos'],
          ['Day trading', '15M, 30M', 'Se cierra el mismo día'],
          ['Swing trading', '1H, 4H', 'Días a semanas'],
          ['Position trading', '1D, 1S', 'Semanas a meses']
        ]],
        ['tip', 'Para empezar suele convenir el swing trading: va más lento, te da tiempo para pensar y paga menos costos que operar todo el día.'],
        ['ex', 'Una acción cotiza a $100. Comprás 10 unidades ($1.000) y la vendés a $108: ganás $80 (8%). Si en cambio cae a $95 y salís ahí, perdés $50 (5%). Los valores son de ejemplo.']
      ],
      quiz: [
        { q: '¿Cuál es la diferencia principal entre trading e inversión?', o: ['El trading solo se hace con dinero prestado', 'El trading mira el movimiento del precio en plazos más cortos; la inversión mira el valor de largo plazo', 'La inversión no tiene riesgo', 'No hay ninguna diferencia'], a: 1, why: 'El horizonte y el enfoque cambian: el trading trabaja sobre el precio y el riesgo de cada operación.' },
        { q: 'Alguien abre y cierra todas sus operaciones el mismo día, mirando gráficos de 15 y 30 minutos. ¿Qué estilo es?', o: ['Scalping', 'Swing trading', 'Day trading', 'Position trading'], a: 2, why: 'Day trading: operaciones intradía, sin dejar posiciones abiertas de un día para el otro.' }
      ]
    },

    {
      id: 'b2', level: 'basico', title: 'Qué se puede operar', mins: 5,
      blocks: [
        ['p', 'Hay muchos mercados. Cada uno tiene su horario, su volatilidad y sus costos. Conviene elegir pocos y conocerlos a fondo.'],
        ['ul', [
          '**Acciones:** partes de una empresa (YPF, Mercado Libre).',
          '**CEDEARs:** certificados que representan acciones del exterior y se compran en pesos en el mercado argentino (Nvidia, Microsoft).',
          '**Forex:** pares de divisas, como EUR/USD. Opera casi las 24 horas de lunes a viernes.',
          '**Materias primas:** oro (XAUUSD), plata, petróleo, cobre.',
          '**Índices:** canastas de empresas, como el S&P 500 o el Nasdaq 100.',
          '**Cripto:** opera 24/7 y puede moverse muy fuerte en poco tiempo.'
        ]],
        ['p', 'La apertura de Wall Street es a las 9:30 hora de Nueva York. En Argentina cae a las 10:30 o a las 11:30 según el horario de verano de EE.UU.'],
        ['h', 'Dos activos para estudiar'],
        ['ul', [
          '**Oro:** se mueve con las tasas de EE.UU., el dólar y el miedo del mercado. Es un refugio clásico.',
          '**Nasdaq 100:** 100 grandes empresas no financieras con mucho peso tecnológico. Reacciona a tasas y a los resultados de las grandes tecnológicas.'
        ]],
        ['tip', 'Los dos tienen mucha liquidez y mucha información disponible, algo ideal para aprender.']
      ],
      quiz: [
        { q: '¿Qué es un CEDEAR?', o: ['Un bono del Tesoro argentino', 'Un certificado que representa acciones del exterior y se compra en pesos en el mercado local', 'Una criptomoneda', 'Un tipo de caución'], a: 1, why: 'Permite exponerte a empresas del exterior desde el mercado argentino.' },
        { q: '¿Qué es el Nasdaq 100?', o: ['Una acción', 'Una materia prima', 'Un índice de 100 grandes empresas no financieras, con mucho peso tecnológico', 'Un par de divisas'], a: 2, why: 'Es un índice: una canasta, no una empresa sola.' }
      ]
    },

    {
      id: 'b3', level: 'basico', title: 'Leer un gráfico: velas y temporalidades', mins: 6,
      blocks: [
        ['p', 'La vela japonesa resume lo que pasó con el precio en un período. Cada vela tiene cuatro datos: apertura, máximo, mínimo y cierre.'],
        ['svg', 'candle'],
        ['ul', [
          '**Cuerpo:** distancia entre apertura y cierre. Un cuerpo grande indica fuerza.',
          '**Mecha:** el rango que el precio visitó y abandonó. Una mecha larga indica rechazo.',
          '**Alcista (verde):** cierra por encima de donde abrió. **Bajista (roja):** cierra por debajo.'
        ]],
        ['h', 'Temporalidad'],
        ['p', 'La temporalidad (timeframe) es el tiempo que representa cada vela: 1 minuto, 15 minutos, 1 hora, 4 horas, 1 día, 1 semana. El mismo mercado se ve distinto en cada una. Los gráficos más largos pesan más: un nivel marcado en el diario importa más que uno de 5 minutos.'],
        ['ex', 'Una vela diaria de oro abre en 2.000, sube hasta 2.030, baja hasta 1.990 y cierra en 2.020. Es verde, con cuerpo de 2.000 a 2.020, mecha superior hasta 2.030 y mecha inferior hasta 1.990. Valores de ejemplo.'],
        ['tip', 'Antes de buscar una entrada, mirá primero el gráfico más largo y recién después bajá al corto.']
      ],
      quiz: [
        { q: 'Una vela alcista (verde) significa que…', o: ['El cierre fue mayor que la apertura', 'El volumen fue alto', 'El máximo fue igual al mínimo', 'El precio no se movió'], a: 0, why: 'Alcista = cierre por encima de la apertura.' },
        { q: '¿Qué suele indicar una mecha superior larga?', o: ['Que el precio subió y fue rechazado antes del cierre', 'Que el precio va a subir mañana sí o sí', 'Que no hubo operaciones', 'Que el mercado estaba cerrado'], a: 0, why: 'Los compradores empujaron arriba, pero los vendedores devolvieron el precio.' }
      ]
    },

    {
      id: 'b4', level: 'basico', title: 'Tendencia, soporte y resistencia', mins: 6,
      blocks: [
        ['p', 'El mercado se mueve en tres modos: tendencia alcista, tendencia bajista o lateral.'],
        ['svg', 'trend'],
        ['ul', [
          '**Alcista:** máximos y mínimos cada vez más altos.',
          '**Bajista:** máximos y mínimos cada vez más bajos.',
          '**Lateral:** el precio rebota entre dos zonas sin dirección clara.'
        ]],
        ['h', 'Soporte y resistencia'],
        ['p', 'El **soporte** es una zona donde el precio rebotó varias veces hacia arriba. La **resistencia** es una zona donde frenó varias veces. Son zonas, no líneas exactas. Cuantos más toques y más largo el gráfico, más relevantes.'],
        ['p', 'Cuando una resistencia se rompe y el precio vuelve a testearla desde arriba, suele funcionar como soporte. Y al revés.'],
        ['tip', 'Operar a favor de la tendencia del gráfico mayor te pone las probabilidades de tu lado.']
      ],
      quiz: [
        { q: '¿Qué define una tendencia alcista?', o: ['Una vela verde grande', 'Máximos y mínimos cada vez más altos', 'Que el precio esté por encima de 100', 'Volumen creciente'], a: 1, why: 'La estructura de máximos y mínimos crecientes es la definición base.' },
        { q: 'El precio rompe una resistencia y luego vuelve a tocarla desde arriba. Suele actuar como…', o: ['Resistencia otra vez', 'Soporte', 'Un nivel sin importancia', 'Señal de venta obligatoria'], a: 1, why: 'Una resistencia rota suele convertirse en soporte.' }
      ]
    },

    {
      id: 'b5', level: 'basico', title: 'Órdenes, spread y apalancamiento', mins: 7,
      blocks: [
        ['h', 'Tipos de orden'],
        ['ul', [
          '**De mercado:** se ejecuta ya, al mejor precio disponible.',
          '**Límite:** se ejecuta solo al precio que fijás o mejor. Comprar con límite a 95 espera que el precio baje a 95.',
          '**Stop:** se activa cuando el precio llega a un nivel. Se usa para el **stop loss**, que corta la pérdida.',
          '**Take profit:** cierra la operación cuando llega a tu objetivo.'
        ]],
        ['h', 'Costos'],
        ['p', 'El **spread** es la diferencia entre el precio de compra (ask) y el de venta (bid). Es un costo que pagás al entrar. A eso se suman comisiones y el **slippage**: la diferencia entre el precio que esperabas y el que obtuviste.'],
        ['h', 'Apalancamiento'],
        ['p', 'Apalancarse es operar una posición más grande que el dinero que ponés como margen. Amplifica ganancias y pérdidas por igual.'],
        ['ex', 'Con apalancamiento 10:1 y $1.000 de margen abrís una posición de $10.000. Si el activo cae 10%, perdés $1.000: todo el margen. Si el bróker cierra la posición por falta de margen, se llama liquidación.'],
        ['tip', 'Si dimensionás la posición por el stop (lección 6), el apalancamiento no cambia cuánto arriesgás. Lo que cambia es lo fácil que resulta arriesgar de más.']
      ],
      quiz: [
        { q: 'Tenés una orden límite de compra a 95 y el precio actual es 100. ¿Cuándo se ejecuta?', o: ['Ya mismo', 'Solo si el precio baja a 95 o menos', 'Solo si sube a 105', 'Nunca'], a: 1, why: 'La orden límite espera al precio que fijaste o uno mejor.' },
        { q: 'Con apalancamiento 10:1 y una posición de $10.000, una caída del 10% genera una pérdida de…', o: ['$100', '$500', '$1.000, que es todo el margen aportado', '$10.000'], a: 2, why: 'Con $1.000 de margen, un 10% de caída sobre $10.000 borra el 100% del margen.' }
      ]
    },

    {
      id: 'b6', level: 'basico', title: 'Gestión del riesgo', mins: 8,
      blocks: [
        ['p', 'Esto es lo que separa a quien sobrevive de quien no. Acertar el análisis importa menos que no perder demasiado cuando te equivocás.'],
        ['ul', [
          '**Arriesgá entre 0,5% y 2% del capital por operación.** Una pérdida es normal; una pérdida enorme no.',
          '**Definí el stop antes de entrar** y no lo muevas en contra.',
          '**Buscá un R:R de 1:1,5 o mejor.** Ganar más de lo que arriesgás compensa los errores.',
          '**Dimensioná la posición:** tamaño = dinero en riesgo ÷ distancia al stop.'
        ]],
        ['ex', 'Capital $10.000, riesgo 1% = $100. Entrada 2.000, stop 1.980 (distancia 20). Tamaño: 100 ÷ 20 = 5 unidades. Objetivo 2.040 (distancia 40): R:R de 1:2 y ganancia de 5 × 40 = $200.'],
        ['h', 'Por qué el R:R cambia todo'],
        ['table', [
          ['R:R', 'Win rate mínimo para no perder'],
          ['1:1', '50%'],
          ['1:2', '33,3%'],
          ['1:3', '25%']
        ]],
        ['h', 'Rachas de pérdidas'],
        ['p', 'Diez pérdidas seguidas con riesgo de 1% te dejan en 90,4% del capital (−9,6%). Con riesgo de 10% por operación te dejan en 34,9% (−65,1%). El mismo error, consecuencias muy distintas.'],
        ['go', 'calculadora', 'Abrir la calculadora de riesgo']
      ],
      quiz: [
        { q: 'Capital de $5.000 y riesgo de 2% por operación. ¿Cuánto dinero arriesgás?', o: ['$50', '$100', '$250', '$1.000'], a: 1, why: '5.000 × 2% = $100.' },
        { q: 'Con un R:R de 1:2, ¿qué porcentaje de aciertos necesitás para no perder (sin contar costos)?', o: ['50%', '66%', '33,3%', '10%'], a: 2, why: 'Break-even = 1 ÷ (1 + 2) = 33,3%.' }
      ]
    },

    {
      id: 'b7', level: 'basico', title: 'Psicología y plan de trading', mins: 6,
      blocks: [
        ['p', 'La mayoría de las pérdidas grandes vienen de decisiones emocionales, no del análisis.'],
        ['ul', [
          '**Miedo:** cerrar las ganadoras demasiado pronto.',
          '**Codicia:** no respetar el objetivo y querer más.',
          '**FOMO:** entrar tarde porque el precio ya se disparó.',
          '**Revenge trading:** operar sin señal para recuperar una pérdida.',
          '**Overtrading:** operar por aburrimiento o ansiedad.'
        ]],
        ['p', 'Tener más voluntad no alcanza. Lo que ayuda es un **plan escrito** que decida por vos antes de que aparezcan las emociones.'],
        ['h', 'Qué lleva un plan mínimo'],
        ['ul', [
          'Qué mercados operás y en qué temporalidad.',
          'Qué señal te da la entrada.',
          'Dónde van el stop y el objetivo.',
          'Cuánto arriesgás por operación.',
          'En qué horarios operás y cuándo no.'
        ]],
        ['tip', 'Una pérdida dentro del plan es un costo normal del negocio, no un fracaso.'],
        ['go', 'plan', 'Armar mi plan y checklist']
      ],
      quiz: [
        { q: 'Después de una pérdida abrís otra operación enseguida, sin señal, para recuperarte. Eso se llama…', o: ['Swing trading', 'Revenge trading', 'Diversificación', 'Backtesting'], a: 1, why: 'Es operar por la emoción de recuperar, no por una señal.' },
        { q: '¿Qué ayuda más a operar con disciplina?', o: ['Mirar el gráfico todo el día', 'Un plan escrito antes de operar', 'Subir el riesgo después de ganar', 'Operar más activos'], a: 1, why: 'El plan decide por vos cuando las emociones aprietan.' }
      ]
    },

    {
      id: 'b8', level: 'basico', title: 'Primer paso: cuenta demo y diario', mins: 5,
      blocks: [
        ['p', 'La cuenta demo te da dinero simulado con precios reales o casi reales. Sirve para probar tu plan sin arriesgar plata. El objetivo no es ganar: es ver si podés seguir el plan con consistencia.'],
        ['h', 'Cómo usarla'],
        ['ul', [
          'Elegí una sola estrategia y un solo activo.',
          'Operá con el riesgo que usarías en real (por ejemplo, 1%).',
          'Anotá cada operación en el diario: por qué entraste, resultado, qué sentiste.',
          'Revisá el diario una vez por semana.'
        ]],
        ['h', 'Cuándo pensar en cuenta real'],
        ['ul', [
          'Tenés una muestra de al menos 30 a 50 operaciones.',
          'Seguiste el plan en casi todas (más del 90%).',
          'El resultado en R es positivo y el drawdown fue el que esperabas.'
        ]],
        ['p', 'La demo tiene límites: ejecuta perfecto, sin slippage real y sin la presión de arriesgar tu dinero. Por eso al pasar a real conviene arrancar con menos riesgo.'],
        ['go', 'diario', 'Abrir el diario'],
        ['go', 'simulador', 'Practicar en el simulador']
      ],
      quiz: [
        { q: '¿Para qué sirve principalmente la cuenta demo?', o: ['Para ganar dinero real', 'Para validar que seguís el plan y que la estrategia funciona sin arriesgar plata', 'Para evitar pagar spreads', 'Para no llevar diario'], a: 1, why: 'Es un laboratorio: se prueba el método, no se busca la ganancia.' },
        { q: '¿Cuál es una señal razonable para pasar a cuenta real?', o: ['Ganar 3 operaciones seguidas', 'Tener decenas de operaciones siguiendo el plan, con resultado positivo y riesgo controlado', 'Haber leído un libro', 'Tener ganas de ganar rápido'], a: 1, why: 'Una muestra amplia y consistente vale más que una racha corta.' }
      ]
    },

    /* ============ INTERMEDIO ============ */
    {
      id: 'i1', level: 'intermedio', title: 'Medias móviles', mins: 6,
      blocks: [
        ['p', 'Una media móvil promedia el precio de las últimas N velas y suaviza el ruido. La **SMA** pesa todas las velas igual. La **EMA** pesa más las recientes, por eso reacciona antes.'],
        ['p', 'Los períodos más usados son 20, 50, 100 y 200.'],
        ['h', 'Tres usos prácticos'],
        ['ul', [
          '**Filtro de tendencia:** precio por encima de la EMA 50 = solo buscás compras. Por debajo = solo ventas.',
          '**Soporte dinámico:** en una tendencia, el precio suele retroceder a la EMA 20 o 50 y rebotar.',
          '**Cruces:** cuando una media corta cruza a una larga puede marcar un cambio de tendencia.'
        ]],
        ['tip', 'Las medias van atrasadas: confirman, no anticipan. En mercados laterales los cruces dan muchas señales falsas.'],
        ['go', 'backtest', 'Probar un cruce de EMAs en el backtester']
      ],
      quiz: [
        { q: '¿Qué diferencia a la EMA de la SMA?', o: ['La EMA da más peso a los precios recientes', 'La EMA usa el volumen', 'La SMA es siempre más rápida', 'Ninguna'], a: 0, why: 'La EMA reacciona antes porque pondera más lo reciente.' },
        { q: 'En un mercado lateral, los cruces de medias móviles suelen generar…', o: ['Operaciones muy rentables', 'Muchas señales falsas', 'Ninguna señal', 'Solo señales de venta'], a: 1, why: 'Sin tendencia, las medias se cruzan una y otra vez sin que el precio siga.' }
      ]
    },

    {
      id: 'i2', level: 'intermedio', title: 'RSI: fuerza relativa', mins: 6,
      blocks: [
        ['p', 'El RSI es un oscilador de 0 a 100 que mide qué tan fuerte fue el movimiento reciente. El período clásico es 14.'],
        ['ul', [
          'Arriba de 70: zona de **sobrecompra**.',
          'Debajo de 30: zona de **sobreventa**.',
          'Alrededor de 50: equilibrio.'
        ]],
        ['p', 'Sobrecomprado no significa “vendé”. En una tendencia fuerte el RSI puede quedarse semanas por encima de 70 mientras el precio sigue subiendo.'],
        ['h', 'Cómo se usa mejor'],
        ['ul', [
          '**En tendencia alcista:** buscar compras cuando el RSI retrocede a la zona de 40 a 50 y se da vuelta.',
          '**En rango:** las zonas de 30 y 70 sí funcionan mejor como extremos.',
          '**Divergencia:** el precio marca un máximo nuevo pero el RSI marca uno más bajo. Avisa pérdida de fuerza.'
        ]],
        ['ex', 'Probá en el backtester la estrategia de RSI con datos “lateral” y con datos “tendencia”. Vas a ver que la misma regla se comporta muy distinto según el contexto.']
      ],
      quiz: [
        { q: 'El RSI marca 80 en una tendencia alcista fuerte. ¿Significa que el precio va a caer?', o: ['Sí, siempre', 'No necesariamente: puede seguir en zona extrema mucho tiempo', 'Sí, en menos de una hora', 'Solo si hay volumen'], a: 1, why: 'En tendencias fuertes el RSI puede permanecer en sobrecompra.' },
        { q: '¿Qué es una divergencia bajista?', o: ['Precio con un máximo nuevo y RSI con un máximo más bajo', 'Precio y RSI bajando juntos', 'RSI en 50', 'Una vela roja grande'], a: 0, why: 'El precio sube pero con menos fuerza: posible agotamiento.' }
      ]
    },

    {
      id: 'i3', level: 'intermedio', title: 'MACD: momentum', mins: 6,
      blocks: [
        ['p', 'El MACD mide el momentum comparando dos EMAs. Se calcula como EMA 12 menos EMA 26. Sobre esa línea se dibuja una **línea de señal** (EMA 9 del MACD) y un **histograma** con la diferencia entre las dos.'],
        ['ul', [
          '**MACD cruza arriba de la señal:** momentum alcista creciente.',
          '**MACD sobre cero:** la EMA corta está por encima de la larga.',
          '**Histograma que se achica:** el impulso pierde fuerza, aunque el precio siga subiendo.'
        ]],
        ['tip', 'Como las medias, el MACD es un indicador que sigue al precio. Funciona mejor en tendencia que en rango. No lo uses solo: combinalo con niveles y estructura.']
      ],
      quiz: [
        { q: '¿Cómo se calcula el MACD con los valores clásicos?', o: ['EMA 12 menos EMA 26', 'RSI menos 50', 'SMA 50 más SMA 200', 'Máximo menos mínimo'], a: 0, why: 'La línea MACD es la diferencia entre la EMA 12 y la EMA 26.' },
        { q: 'El histograma del MACD se va achicando mientras el precio sigue subiendo. Suele indicar…', o: ['Que el momentum pierde fuerza', 'Que hay que comprar más', 'Que el mercado cerró', 'Nada'], a: 0, why: 'Menos impulso en cada tramo alcista es una advertencia, no una orden de venta.' }
      ]
    },

    {
      id: 'i4', level: 'intermedio', title: 'Volumen y volatilidad (ATR)', mins: 6,
      blocks: [
        ['p', 'El **volumen** confirma movimientos: una ruptura con volumen alto es más creíble que una con volumen flojo. En forex y en CFDs de oro el volumen que ves es del bróker, no del mercado completo, así que es una referencia más débil.'],
        ['p', 'El **ATR** (Average True Range) mide cuánto se mueve el precio en promedio por vela. No dice la dirección, dice el tamaño del movimiento normal.'],
        ['h', 'Para qué sirve'],
        ['ul', [
          '**Stops adaptativos:** stop = 1,5 × ATR. Se ensancha cuando el mercado se agita y se achica cuando se calma.',
          '**Tamaño de posición:** un stop más ancho implica menos unidades para el mismo riesgo.',
          '**Contexto:** ATR muy alto = mercado nervioso, ojo con los saltos.'
        ]],
        ['ex', 'ATR diario del activo = 25. Stop de 1,5 × ATR = 37,5 puntos. Con $100 de riesgo, el tamaño es 100 ÷ 37,5 = 2,67 unidades.'],
        ['tip', 'El backtester de esta app usa justamente stops en múltiplos de ATR.']
      ],
      quiz: [
        { q: '¿Qué mide el ATR?', o: ['La dirección de la tendencia', 'El rango de movimiento promedio por vela', 'El volumen', 'La diferencia entre dos EMAs'], a: 1, why: 'Mide volatilidad, no dirección.' },
        { q: '¿Por qué conviene un stop basado en ATR y no uno fijo?', o: ['Porque siempre es más chico', 'Porque se adapta a la volatilidad y evita que el ruido normal te saque', 'Porque elimina el riesgo', 'Porque lo exige el bróker'], a: 1, why: 'Cuando el mercado se mueve más, necesitás más aire; cuando se calma, menos.' }
      ]
    },

    {
      id: 'i5', level: 'intermedio', title: 'Patrones de velas y de gráfico', mins: 7,
      blocks: [
        ['h', 'Velas de rechazo y giro'],
        ['ul', [
          '**Martillo / pin bar:** cuerpo chico y mecha larga. En un soporte tras una caída sugiere rechazo hacia abajo y posible rebote.',
          '**Envolvente:** una vela cuyo cuerpo cubre por completo el de la anterior. Muestra que el control cambió de manos.',
          '**Doji:** apertura y cierre casi iguales. Indecisión.'
        ]],
        ['h', 'Patrones de gráfico'],
        ['ul', [
          '**Doble techo / doble piso:** dos máximos (o mínimos) similares en una zona. Se confirma al romper el punto intermedio.',
          '**Bandera:** pausa breve dentro de una tendencia antes de continuar.',
          '**Triángulo:** el rango se comprime hasta que el precio rompe hacia algún lado.',
          '**Hombro-cabeza-hombro:** posible reversión de tendencia.'
        ]],
        ['tip', 'Una vela de rechazo en un nivel clave y a favor de la tendencia vale más que cinco velas bonitas en el medio de la nada. El contexto manda.']
      ],
      quiz: [
        { q: 'Aparece un martillo en una zona de soporte, después de una caída. Suele sugerir…', o: ['Rechazo de precios bajos y posible rebote', 'Que el precio va a caer más', 'Que hay que cerrar la plataforma', 'Nada, nunca importa'], a: 0, why: 'La mecha inferior larga muestra que los vendedores no lograron sostener los mínimos.' },
        { q: '¿Cuándo se confirma un doble techo?', o: ['Cuando se forma el segundo máximo', 'Cuando el precio rompe el mínimo que hay entre los dos máximos', 'Cuando el RSI llega a 50', 'Nunca se confirma'], a: 1, why: 'La confirmación llega con la ruptura del soporte intermedio.' }
      ]
    },

    {
      id: 'i6', level: 'intermedio', title: 'Multi-timeframe y tus primeras estrategias', mins: 8,
      blocks: [
        ['p', 'El enfoque **top-down** usa tres gráficos con roles distintos:'],
        ['ul', [
          '**Temporalidad alta:** define el sesgo (compras o ventas).',
          '**Temporalidad media:** marca la zona donde querés entrar.',
          '**Temporalidad baja:** da el gatillo de entrada y un stop más ajustado.'
        ]],
        ['p', 'Con ese esquema armamos cuatro estrategias simples, dos para oro y dos para Nasdaq 100, una de day trading y una de swing para cada uno. Todas comparten la misma idea: sesgo en el gráfico mayor, retroceso a una zona y vela de confirmación.'],
        ['h', 'Evitá los datos de alto impacto'],
        ['p', 'El oro y el Nasdaq reaccionan fuerte al empleo de EE.UU. (NFP), a la inflación (CPI) y a las decisiones de tasas. En esas ventanas la volatilidad se dispara y los spreads se agrandan. Lo prudente es no abrir operaciones nuevas 15 a 30 minutos antes y después.'],
        ['go', 'estrategias', 'Ver las 4 estrategias']
      ],
      quiz: [
        { q: 'En el enfoque top-down, ¿para qué se usa el gráfico diario?', o: ['Para el gatillo exacto de entrada', 'Para definir el sesgo o tendencia', 'Para calcular el spread', 'Para nada'], a: 1, why: 'La temporalidad alta fija la dirección; las bajas afinan la entrada.' },
        { q: '¿Por qué conviene no abrir operaciones justo antes de datos como NFP o CPI?', o: ['Porque el mercado está cerrado', 'Porque la volatilidad y los spreads se disparan y los movimientos son erráticos', 'Porque el bróker lo prohíbe', 'Porque no hay volumen'], a: 1, why: 'El precio puede saltar en ambas direcciones y llevarse tu stop.' }
      ]
    },

    {
      id: 'i7', level: 'intermedio', title: 'Medir resultados: R, expectativa y profit factor', mins: 7,
      blocks: [
        ['p', 'Medir en **R** (múltiplos del riesgo inicial) permite comparar operaciones de cualquier tamaño. Una ganadora de +2R ganó el doble de lo que arriesgaste. Una perdedora normal es −1R.'],
        ['table', [
          ['Métrica', 'Qué dice'],
          ['Win rate', '% de operaciones ganadoras'],
          ['Expectativa', 'R promedio por operación'],
          ['Profit factor', 'Ganancias brutas ÷ pérdidas brutas'],
          ['Drawdown', 'Caída máxima desde un pico']
        ]],
        ['ex', '20 operaciones: 8 ganadoras de +2R y 12 perdedoras de −1R. Total = 16 − 12 = +4R. Expectativa = 4 ÷ 20 = +0,2R por operación. Win rate 40%. Profit factor = 16 ÷ 12 = 1,33.'],
        ['tip', 'Un win rate bajo no es un problema si el R:R es bueno. Lo que importa es la expectativa.'],
        ['go', 'diario', 'Ver mis métricas en el diario']
      ],
      quiz: [
        { q: 'Win rate de 40%, ganadoras de +2R y perdedoras de −1R. ¿Cuál es la expectativa?', o: ['−0,2R', '0R', '+0,2R', '+1R'], a: 2, why: '0,4 × 2 − 0,6 × 1 = +0,2R por operación.' },
        { q: 'Un profit factor menor a 1 significa que…', o: ['Ganás más de lo que perdés', 'Las pérdidas brutas superan a las ganancias brutas', 'El win rate es 100%', 'No hubo operaciones'], a: 1, why: 'Con PF < 1 el resultado total es negativo.' }
      ]
    },

    /* ============ AVANZADO ============ */
    {
      id: 'a1', level: 'avanzado', title: 'Tamaño de muestra y varianza', mins: 6,
      blocks: [
        ['p', 'Con pocas operaciones, el azar domina. Una estrategia con ventaja real puede perder diez veces seguidas, y una sin ventaja puede ganar diez veces seguidas.'],
        ['ul', [
          '**15 operaciones** no alcanzan para juzgar nada.',
          '**30 a 50** dan una primera idea, todavía con mucho margen de error.',
          '**100 o más** empiezan a ser una base seria.'
        ]],
        ['p', 'Con un 40% de aciertos, en una muestra de cientos de operaciones es habitual ver rachas de 8 pérdidas seguidas. Por eso el riesgo por operación se define para sobrevivir a esas rachas, no para el mejor escenario.'],
        ['tip', 'Antes de decir “esta estrategia no funciona” o “funciona”, preguntate cuántas operaciones tenés detrás.']
      ],
      quiz: [
        { q: '¿Por qué 15 operaciones no alcanzan para juzgar una estrategia?', o: ['Porque la plataforma lo impide', 'Porque con muestras chicas domina el azar', 'Porque son pocas para pagar comisiones', 'Porque no hay indicadores'], a: 1, why: 'El resultado puede ser suerte o mala racha, no ventaja real.' },
        { q: 'Con 40% de aciertos, una racha de unas 8 pérdidas seguidas es…', o: ['Imposible', 'Un error del bróker', 'Algo normal que hay que poder aguantar', 'Señal de que hay que duplicar el riesgo'], a: 2, why: 'Dimensioná el riesgo pensando en esas rachas.' }
      ]
    },

    {
      id: 'a2', level: 'avanzado', title: 'Drawdown y riesgo de ruina', mins: 6,
      blocks: [
        ['p', 'El **drawdown** es la caída desde el máximo de capital. Lo difícil no es solo soportarlo: es recuperarlo, porque la recuperación es asimétrica.'],
        ['table', [
          ['Caída', 'Ganancia necesaria para volver'],
          ['−10%', '+11,1%'],
          ['−20%', '+25%'],
          ['−30%', '+42,9%'],
          ['−50%', '+100%'],
          ['−75%', '+300%']
        ]],
        ['h', 'Cómo se controla'],
        ['ul', [
          '**Riesgo chico por operación:** es la palanca principal.',
          '**Límite diario y semanal:** por ejemplo, frenar al perder 3% en el día o 6% en la semana.',
          '**Reducir tamaño tras un drawdown:** operar más chico mientras te recuperás.',
          '**Pausa obligatoria:** después de varias pérdidas seguidas, cortá y revisá el diario.'
        ]],
        ['tip', 'Los límites diarios protegen contra el efecto cascada: una mala mañana que se convierte en una mala semana por operar con rabia.']
      ],
      quiz: [
        { q: 'Después de perder el 50% del capital, ¿cuánto necesitás ganar para volver al punto de partida?', o: ['50%', '75%', '100%', '150%'], a: 2, why: 'Con la mitad del capital tenés que duplicarlo.' },
        { q: '¿Para qué sirve un límite de pérdida diaria?', o: ['Para pagar menos comisiones', 'Para cortar el efecto cascada y operar con la cabeza fría', 'Para aumentar el riesgo', 'No sirve'], a: 1, why: 'Evita que las emociones empujen a seguir operando perdiendo.' }
      ]
    },

    {
      id: 'a3', level: 'avanzado', title: 'Backtesting sin engañarte', mins: 8,
      blocks: [
        ['p', 'El backtest aplica tus reglas a datos pasados para ver cómo habrían funcionado. Es útil, pero es muy fácil hacerlo mal y creer en resultados que no existen.'],
        ['h', 'Los cuatro errores clásicos'],
        ['ul', [
          '**Overfitting (sobreajuste):** retocar parámetros hasta que el pasado dé bien. La estrategia queda hecha a medida de esos datos y falla con datos nuevos.',
          '**Look-ahead bias:** usar en la señal información que en ese momento todavía no existía, por ejemplo operar al cierre de una vela con un dato que solo se conoce después.',
          '**Costos subestimados:** olvidarse del spread, comisiones y slippage. En estrategias con muchas operaciones pueden borrar la ganancia.',
          '**Sesgo de supervivencia:** probar solo con activos que existen hoy e ignorar los que desaparecieron.'
        ]],
        ['p', 'En el backtester de esta app la señal se calcula al cierre de la vela y la entrada se hace en la apertura de la siguiente. Si una vela toca el stop y el objetivo a la vez, se asume que tocó el stop primero. Son supuestos conservadores a propósito.'],
        ['tip', 'Con datos simulados, ninguna estrategia tiene una ventaja real: sirve para entender la mecánica. Para evaluar de verdad necesitás datos reales.'],
        ['go', 'backtest', 'Ir al backtester']
      ],
      quiz: [
        { q: '¿Qué es el overfitting en un backtest?', o: ['Usar demasiados activos', 'Ajustar los parámetros tanto al pasado que la estrategia solo funciona en esos datos', 'Operar con poco capital', 'Usar un timeframe muy largo'], a: 1, why: 'Se optimiza el ruido del pasado y no una ventaja real.' },
        { q: '¿Qué es el look-ahead bias?', o: ['Mirar el gráfico semanal', 'Usar en la señal información que en ese momento no estaba disponible', 'Cerrar operaciones antes de tiempo', 'Operar solo compras'], a: 1, why: 'El backtest “ve el futuro” y los resultados salen irreales.' }
      ]
    },

    {
      id: 'a4', level: 'avanzado', title: 'Out-of-sample y walk-forward', mins: 7,
      blocks: [
        ['p', 'Para saber si una estrategia generaliza, separás los datos en dos partes.'],
        ['ul', [
          '**In-sample (diseño):** datos con los que pensás y ajustás las reglas.',
          '**Out-of-sample (validación):** datos que no tocaste. Se prueban una sola vez al final.'
        ]],
        ['p', 'El **walk-forward** repite el proceso por ventanas sucesivas: ajustás en un tramo, validás en el siguiente, avanzás y volvés a empezar. Es más exigente y más realista.'],
        ['h', 'Señales de robustez'],
        ['ul', [
          'El tramo out-of-sample se parece al de diseño.',
          'Parámetros vecinos también funcionan: ves una meseta, no un pico aislado.',
          'Hay suficientes operaciones en ambos tramos.',
          'La regla tiene una lógica que podés explicar.'
        ]],
        ['tip', 'En el backtester, el recuadro “Reservar último %” hace exactamente esta división. Si el tramo reservado se hunde, sospechá sobreajuste.'],
        ['go', 'backtest', 'Probar la división en el backtester']
      ],
      quiz: [
        { q: '¿Qué son los datos out-of-sample?', o: ['Los más recientes siempre', 'Datos que no se usaron para diseñar ni ajustar la estrategia', 'Datos de otro activo', 'Datos sin precios'], a: 1, why: 'Sirven para validar sin que el diseño los haya contaminado.' },
        { q: 'Un parámetro “óptimo” funciona muy bien, pero con valores vecinos la estrategia pierde. Es…', o: ['Una excelente señal', 'Una mala señal: probablemente sobreajuste', 'Irrelevante', 'Una prueba de que hay que subir el riesgo'], a: 1, why: 'Un pico aislado suele ser ruido. Se busca una meseta estable.' }
      ]
    },

    {
      id: 'a5', level: 'avanzado', title: 'Macro: lo que mueve al oro y al Nasdaq', mins: 8,
      blocks: [
        ['p', 'Los grandes movimientos suelen tener detrás una historia macro. No hace falta ser economista, pero sí saber qué mirar.'],
        ['table', [
          ['Variable', 'Por qué importa'],
          ['Tasas de la Fed', 'Mueven el costo del dinero y la valuación de todo'],
          ['Inflación (CPI)', 'Define las expectativas de tasas'],
          ['Empleo (NFP)', 'Señal de fortaleza de la economía de EE.UU.'],
          ['Dólar (DXY)', 'El oro cotiza en dólares'],
          ['Rendimiento de bonos del Tesoro', 'Alternativa sin riesgo a oro y acciones']
        ]],
        ['h', 'Relaciones habituales'],
        ['ul', [
          '**Oro:** suele sufrir cuando suben las tasas reales (porque no paga interés) y cuando el dólar se fortalece. Tiende a subir con el miedo del mercado.',
          '**Nasdaq:** las tecnológicas de crecimiento son sensibles a las tasas. Además, los resultados de las grandes empresas mueven al índice completo.'
        ]],
        ['p', 'Estas relaciones cambian con el tiempo. Tomalas como hipótesis para contrastar, no como leyes.'],
        ['tip', 'Mirá el calendario económico cada semana. Un dato importante puede invalidar un setup técnico perfecto.']
      ],
      quiz: [
        { q: 'Cuando suben las tasas reales, el oro suele…', o: ['Subir siempre', 'Enfrentar presión bajista, porque no paga interés', 'No reaccionar nunca', 'Dejar de cotizar'], a: 1, why: 'Sube el costo de oportunidad de mantener un activo que no rinde interés.' },
        { q: 'Se publica un dato de inflación importante en 20 minutos. ¿Qué es más prudente?', o: ['Entrar con más tamaño para aprovechar', 'No abrir operaciones nuevas y esperar la reacción', 'Sacar el stop', 'Ignorar el calendario'], a: 1, why: 'La volatilidad es errática justo en esa ventana.' }
      ]
    },

    {
      id: 'a6', level: 'avanzado', title: 'Del demo al bot y a la cuenta real', mins: 8,
      blocks: [
        ['p', 'Automatizar no es el primer paso, es uno de los últimos. Un bot ejecuta tus reglas sin emociones, pero también ejecuta tus errores sin dudar.'],
        ['h', 'Etapas'],
        ['ul', [
          '**1. Alertas:** el sistema te avisa cuando se cumplen las reglas y vos decidís.',
          '**2. Ejecución manual en demo:** operás las alertas y llevás el diario.',
          '**3. Bot en demo:** el sistema ejecuta solo, vos supervisás varias semanas.',
          '**4. Real chico:** riesgo bajo y capital que podés perder por completo.'
        ]],
        ['h', 'Requisitos antes de automatizar'],
        ['ul', [
          'Reglas 100% objetivas, sin “me parece”.',
          'Backtest con costos y validación out-of-sample.',
          'Varias semanas de demo con resultados parecidos al backtest.',
          'Límites de riesgo en el código: pérdida máxima diaria y un corte de emergencia.',
          'Registro de cada orden y monitoreo de errores.'
        ]],
        ['h', 'Pasar a real'],
        ['p', 'Empezá con la mitad o un cuarto del riesgo planificado (por ejemplo 0,25% a 0,5% por operación) y subí de a poco si el comportamiento se mantiene. Consultá con un contador cómo tributan las ganancias de lo que operes.'],
        ['tip', 'Si no podés explicar tu estrategia en cinco reglas escritas, todavía no está lista para un bot.']
      ],
      quiz: [
        { q: '¿Cuál es un requisito antes de automatizar una estrategia?', o: ['Que las reglas sean 100% objetivas', 'Que el bot opere con más riesgo', 'Tener muchas estrategias a la vez', 'Que no haya backtest'], a: 0, why: 'Un bot no puede ejecutar “me parece”: necesita reglas exactas.' },
        { q: 'Al pasar a cuenta real conviene…', o: ['Subir el riesgo al máximo', 'Empezar con menos riesgo que el planificado y subir de a poco', 'Operar sin stop', 'Saltear la demo'], a: 1, why: 'La presión de arriesgar dinero real cambia el comportamiento. Se escala gradualmente.' }
      ]
    }
  ];

  var glossary = [
    ['Activo', 'Lo que se compra o vende: una acción, una divisa, el oro, un índice.'],
    ['Alcista / Bajista', 'Alcista: el precio sube o se espera que suba. Bajista: baja o se espera que baje.'],
    ['Ask / Bid', 'Ask es el precio al que podés comprar. Bid es el precio al que podés vender. La diferencia es el spread.'],
    ['Spread', 'Diferencia entre ask y bid. Es un costo de entrada.'],
    ['Slippage', 'Diferencia entre el precio esperado y el precio real de ejecución.'],
    ['Posición larga / corta', 'Larga: comprás esperando que suba. Corta: vendés esperando que baje.'],
    ['Lote', 'Unidad estándar de tamaño en forex y CFDs. En muchos brókers 1 lote de oro equivale a 100 onzas; confirmalo en el tuyo.'],
    ['Apalancamiento', 'Operar una posición mayor que el capital aportado usando margen. Amplifica ganancias y pérdidas.'],
    ['Margen', 'Dinero que se bloquea como garantía para sostener una posición apalancada.'],
    ['Liquidación (margin call)', 'Cierre forzoso de una posición cuando el margen ya no alcanza para cubrir las pérdidas.'],
    ['Stop loss', 'Orden que cierra la operación al llegar a un precio de pérdida máxima aceptada.'],
    ['Take profit', 'Orden que cierra la operación al llegar al objetivo de ganancia.'],
    ['Orden de mercado', 'Se ejecuta de inmediato al mejor precio disponible.'],
    ['Orden límite', 'Se ejecuta solo al precio fijado o mejor.'],
    ['R / R-múltiplo', 'Unidad de medida: 1R es lo que arriesgaste en la operación. +2R es ganar el doble.'],
    ['R:R', 'Relación entre lo que arriesgás y lo que buscás ganar. 1:2 significa ganar el doble de lo arriesgado.'],
    ['Win rate', 'Porcentaje de operaciones ganadoras.'],
    ['Expectativa', 'Resultado promedio esperado por operación, medido en R.'],
    ['Profit factor', 'Ganancias brutas divididas por pérdidas brutas. Mayor a 1 es positivo.'],
    ['Drawdown', 'Caída del capital desde su máximo hasta un mínimo posterior.'],
    ['Timeframe / Temporalidad', 'Tiempo que representa cada vela: 1M, 15M, 1H, 4H, 1D, 1S.'],
    ['Vela japonesa', 'Representación de apertura, máximo, mínimo y cierre de un período.'],
    ['Mecha / Sombra', 'Línea fina de una vela que muestra el rango recorrido más allá del cuerpo.'],
    ['Soporte', 'Zona donde el precio tendió a frenar su caída.'],
    ['Resistencia', 'Zona donde el precio tendió a frenar su suba.'],
    ['Tendencia', 'Dirección predominante del precio: alcista, bajista o lateral.'],
    ['Pullback', 'Retroceso temporal dentro de una tendencia.'],
    ['Breakout (ruptura)', 'Cuando el precio supera una resistencia o pierde un soporte.'],
    ['Reteste', 'Cuando el precio vuelve a tocar un nivel roto para confirmarlo.'],
    ['SMA', 'Media móvil simple: promedio de las últimas N velas.'],
    ['EMA', 'Media móvil exponencial: da más peso a los precios recientes.'],
    ['RSI', 'Oscilador de 0 a 100 que mide la fuerza del movimiento reciente.'],
    ['MACD', 'Indicador de momentum basado en la diferencia entre dos EMAs.'],
    ['ATR', 'Rango verdadero promedio: mide la volatilidad por vela.'],
    ['VWAP', 'Precio promedio ponderado por volumen durante la sesión. Se usa como referencia intradía.'],
    ['Volumen', 'Cantidad operada en un período.'],
    ['Volatilidad', 'Cuánto se mueve el precio. Más volatilidad implica más riesgo y más oportunidad.'],
    ['Liquidez', 'Facilidad para comprar o vender sin mover el precio.'],
    ['CEDEAR', 'Certificado de depósito que representa acciones del exterior y se opera en pesos en el mercado argentino.'],
    ['CFD', 'Contrato por diferencia: derivado que replica el precio de un activo sin ser dueño de él. La disponibilidad depende del bróker.'],
    ['Bróker', 'Intermediario que te da acceso al mercado.'],
    ['Cuenta demo', 'Cuenta con dinero simulado para practicar.'],
    ['Scalping', 'Operaciones de segundos a minutos buscando ganancias chicas y frecuentes.'],
    ['Day trading', 'Operaciones que se abren y cierran el mismo día.'],
    ['Swing trading', 'Operaciones que duran días o semanas.'],
    ['Position trading', 'Posiciones de semanas a meses basadas en tendencias grandes.'],
    ['Backtest', 'Prueba de una estrategia sobre datos históricos.'],
    ['Overfitting', 'Sobreajuste de una estrategia a datos pasados, hasta que deja de servir con datos nuevos.'],
    ['Look-ahead bias', 'Error de usar información futura en una señal de backtest.'],
    ['In-sample / Out-of-sample', 'Datos usados para diseñar la estrategia y datos reservados para validarla.'],
    ['Walk-forward', 'Validación por ventanas sucesivas de ajuste y prueba.'],
    ['NFP', 'Non-Farm Payrolls: informe mensual de empleo de EE.UU. Mueve fuerte al dólar, al oro y a los índices.'],
    ['CPI', 'Índice de precios al consumidor de EE.UU. Es la referencia de inflación.'],
    ['Fed', 'Reserva Federal de EE.UU. Fija la tasa de interés de referencia.'],
    ['DXY', 'Índice del dólar frente a una canasta de monedas.'],
    ['Revenge trading', 'Operar sin señal para recuperar una pérdida.'],
    ['FOMO', 'Miedo a quedarse afuera: entrar tarde a un movimiento ya extendido.']
  ];

  var strategies = [
    {
      id: 'oro-swing', asset: 'Oro (XAUUSD)', style: 'Swing trading', tf: 'Contexto D · Entrada 4H',
      rows: [
        ['Sesgo', 'Estructura de máximos y mínimos del gráfico diario.'],
        ['Entrada', 'Retroceso a una zona de soporte o resistencia diaria, o a la EMA 50 de 4H, con vela de rechazo.'],
        ['Stop', 'Más allá de la zona usada como referencia.'],
        ['Objetivo', 'Siguiente nivel relevante del diario. R:R mínimo 1:2.'],
        ['Evitar', 'Semanas con decisión de tasas, NFP o CPI sin haber leído el calendario.']
      ],
      preset: { strategy: 'pullback', p1: 50, p2: 20 }
    },
    {
      id: 'oro-day', asset: 'Oro (XAUUSD)', style: 'Day trading', tf: 'Contexto 1H · Entrada 15M',
      rows: [
        ['Sesión', 'Solapamiento Londres y Nueva York, donde el oro se mueve más.'],
        ['Sesgo', 'EMA 50 de 1H: solo compras arriba, solo ventas abajo.'],
        ['Entrada', 'Retroceso a la EMA 20 de 15M con vela de rechazo a favor del sesgo.'],
        ['Stop', 'Último mínimo o máximo antes de la entrada.'],
        ['Objetivo', '1,5 a 2 veces el riesgo, o el siguiente nivel de 1H.'],
        ['Evitar', '15 a 30 minutos antes y después de datos importantes de EE.UU.']
      ],
      preset: { strategy: 'pullback', p1: 50, p2: 20 }
    },
    {
      id: 'nq-swing', asset: 'Nasdaq 100', style: 'Swing trading', tf: 'Contexto D · Entrada 4H',
      rows: [
        ['Sesgo', 'Estructura diaria y EMA 50 diaria.'],
        ['Entrada', 'Retroceso a soporte o resistencia diaria, o a la EMA 20 o 50 de 4H, con vela de confirmación.'],
        ['Stop', 'Fuera de la zona técnica de referencia.'],
        ['Objetivo', 'Siguiente nivel diario. R:R mínimo 1:2.'],
        ['Evitar', 'Días de resultados de las grandes tecnológicas y de decisiones de tasas.']
      ],
      preset: { strategy: 'pullback', p1: 50, p2: 20 }
    },
    {
      id: 'nq-day', asset: 'Nasdaq 100', style: 'Day trading', tf: 'Contexto 1H · Entrada 15M',
      rows: [
        ['Sesión', 'Primeras una o dos horas de Wall Street, con más liquidez.'],
        ['Sesgo', 'EMA 50 de 1H.'],
        ['Entrada', 'Ruptura y reteste del rango de apertura (primeros 30 a 60 minutos), o retroceso al VWAP a favor del sesgo.'],
        ['Stop', 'Del otro lado del rango de apertura o del último swing.'],
        ['Objetivo', '1,5 a 2 veces el riesgo.'],
        ['Evitar', 'Operar en las ventanas de noticias de tasas e inflación.']
      ],
      preset: { strategy: 'breakout', p1: 20, p2: 0 }
    }
  ];

  var tips = [
    'Antes de buscar entradas, mirá el gráfico más largo. El contexto manda sobre el gatillo.',
    'Definí el stop antes de entrar. Si no sabés dónde estás equivocado, todavía no tenés operación.',
    'Un win rate bajo no es un problema si tus ganadoras son más grandes que tus perdedoras.',
    'Tu primer objetivo no es ganar plata: es seguir el plan durante 50 operaciones.',
    'Si el precio ya se disparó, esperá el retroceso. Perseguir velas es la forma más cara de operar.',
    'Una racha de pérdidas es parte de cualquier estrategia. Lo que la hace sobrevivible es el riesgo chico.',
    'Revisá el diario una vez por semana. Los patrones de error se ven en conjunto, no operación por operación.',
    'Mirá el calendario económico los domingos. Evita sorpresas durante la semana.',
    'Menos activos, mejor conocidos. Elegí uno o dos y estudiá cómo se comportan.',
    'Si dudás de una operación, el tamaño es la respuesta: operá más chico, no más grande.'
  ];

  var checklist = [
    '¿Tengo un sesgo claro en el gráfico mayor?',
    '¿Hay una zona o nivel claro para entrar?',
    '¿Tengo una señal de confirmación, como una vela de rechazo?',
    '¿Definí el stop antes de entrar?',
    '¿El R:R es de al menos 1:1,5?',
    '¿Arriesgo 1% o menos del capital?',
    '¿No hay datos importantes en los próximos 30 minutos?',
    '¿Estoy tranquilo, sin ganas de recuperar una pérdida?'
  ];

  var planFields = [
    ['mercado', 'Mercados que opero', 'Ej: oro (XAUUSD)'],
    ['timeframe', 'Temporalidades', 'Ej: contexto diario, entrada 4H'],
    ['setup', 'Señal de entrada', 'Ej: retroceso a EMA 50 con vela de rechazo'],
    ['stop', 'Dónde va el stop', 'Ej: más allá del último mínimo'],
    ['objetivo', 'Dónde va el objetivo', 'Ej: siguiente nivel diario, R:R 1:2'],
    ['riesgo', 'Riesgo por operación', 'Ej: 1% del capital'],
    ['horarios', 'Horarios y cuándo NO opero', 'Ej: no opero antes de datos de EE.UU.']
  ];

  var api = { levels: levels, lessons: lessons, glossary: glossary, strategies: strategies, tips: tips, checklist: checklist, planFields: planFields };
  root.TPC = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
