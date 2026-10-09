import type { IconName } from "@/components/Icon"



export type LangId =
  | "zh"
  | "en"
  | "es"
  | "ja"
  | "fr"
  | "ko"
  | "de"
  | "pt"
  | "ru"
  | "it"
  | "nl"
  | "pl"
  | "sv"
  | "tr"
  | "id"
  | "ms"
  | "th"
  | "vi"
  | "ar"
  | "hi"

/** 翻译语言清单：native 为该语言自身的文字，label 为中文名称 */
export type LanguageOption = {
  id: LangId
  /** 该语言文字，如 English / Español / 日本語 */
  native: string
  /** 中文名称，如 英语（美国）/ 西班牙语 */
  label: string
  short: string
}

/** 语言库全量清单：我的 → 翻译语言 使用，共 20 种 */
export const allLanguages: LanguageOption[] = [
  { id: "zh", native: "中文", label: "中文（普通话）", short: "中文" },
  { id: "en", native: "English", label: "英语（美国）", short: "英语" },
  { id: "es", native: "Español", label: "西班牙语", short: "西语" },
  { id: "ja", native: "日本語", label: "日语", short: "日语" },
  { id: "fr", native: "Français", label: "法语", short: "法语" },
  { id: "ko", native: "한국어", label: "韩语", short: "韩语" },
  { id: "de", native: "Deutsch", label: "德语", short: "德语" },
  { id: "pt", native: "Português", label: "葡萄牙语", short: "葡语" },
  { id: "ru", native: "Русский", label: "俄语", short: "俄语" },
  { id: "it", native: "Italiano", label: "意大利语", short: "意语" },
  { id: "nl", native: "Nederlands", label: "荷兰语", short: "荷语" },
  { id: "pl", native: "Polski", label: "波兰语", short: "波兰语" },
  { id: "sv", native: "Svenska", label: "瑞典语", short: "瑞典语" },
  { id: "tr", native: "Türkçe", label: "土耳其语", short: "土耳其语" },
  { id: "id", native: "Bahasa Indonesia", label: "印尼语", short: "印尼语" },
  { id: "ms", native: "Bahasa Melayu", label: "马来语", short: "马来语" },
  { id: "th", native: "ไทย", label: "泰语", short: "泰语" },
  { id: "vi", native: "Tiếng Việt", label: "越南语", short: "越南语" },
  { id: "ar", native: "العربية", label: "阿拉伯语", short: "阿拉伯语" },
  { id: "hi", native: "हिन्दी", label: "印地语", short: "印地语" },
]

export function langOption(id: LangId) {
  return allLanguages.find((item) => item.id === id) ?? allLanguages[0]
}

/** 句级词典：每种语言按同一顺序给出 14 句高频表达，下标一致即可互译 */
export const sentences: Record<LangId, string[]> = {
  zh: ["请问最近的地铁站在哪里？","我对坚果过敏。","可以帮我叫一辆出租车吗？","这个多少钱？","我想要一杯咖啡。","洗手间在哪里？","我不吃辣。","请带我去这个地址。","我需要一个靠窗的座位。","这里可以用信用卡吗？","我的航班几点起飞？","请帮我联系医生。","谢谢你的帮助。","我可以退货吗？","喂，你能听到我说话吗？","能听到，画面也很清晰。","好，我们来对一下计划。","好的，我先把重点发给你。","好的，那我们一会儿再聊！"],
  en: ["Excuse me, where is the nearest subway station?","I am allergic to nuts.","Could you call a taxi for me?","How much is this?","I would like a cup of coffee.","Where is the restroom?","I do not eat spicy food.","Please take me to this address.","I need a seat by the window.","Can I pay by credit card here?","What time does my flight depart?","Please help me contact a doctor.","Thank you for your help.","Can I return this?","Hi, can you hear me now?","I can hear you, and the video is clear too.","Great, let's go over the plan.","Sure, let me send you the key points first.","Sounds good. Talk to you soon!"],
  es: ["Perdón, ¿dónde está la estación de metro más cercana?","Soy alérgico a los frutos secos.","¿Puede llamarme un taxi, por favor?","¿Cuánto cuesta esto?","Quisiera un café, por favor.","¿Dónde está el baño?","No como comida picante.","Lléveme a esta dirección, por favor.","Necesito un asiento junto a la ventana.","¿Puedo pagar con tarjeta de crédito?","¿A qué hora sale mi vuelo?","Por favor, ayúdame a contactar a un médico.","Gracias por tu ayuda.","¿Puedo devolver esto?","Hola, ¿me puedes oír ahora?","Te escucho bien y la imagen también es clara.","Genial, repasemos el plan.","Vale, primero te envío los puntos clave.","Me parece bien. ¡Hablamos pronto!"],
  ja: ["すみません、最寄りの地下鉄の駅はどこですか？","ナッツアレルギーがあります。","タクシーを呼んでいただけますか？","これはいくらですか？","コーヒーを一杯お願いします。","お手洗いはどこですか？","辛い物は食べられません。","この住所までお願いします。","窓側の席をお願いします。","クレジットカードは使えますか？","私の便は何時に出発しますか？","医者を呼んでください。","助けてくれてありがとう。","返品できますか？","もしもし、今聞こえますか？","聞こえます、映像もはっきりしています。","では、計画を確認しましょう。","はい、まず要点を送りますね。","いいですね。また後で話しましょう！"],
  fr: ["Excusez-moi, où est la station de métro la plus proche ?","Je suis allergique aux noix.","Pouvez-vous m'appeler un taxi, s'il vous plaît ?","Combien ça coûte ?","Je voudrais un café, s'il vous plaît.","Où sont les toilettes ?","Je ne mange pas épicé.","Emmenez-moi à cette adresse, s'il vous plaît.","J'ai besoin d'une place près de la fenêtre.","Puis-je payer par carte de crédit ici ?","À quelle heure mon vol décolle-t-il ?","Aidez-moi à contacter un médecin, s'il vous plaît.","Merci pour votre aide.","Puis-je retourner cet article ?","Salut, tu m'entends maintenant ?","Je t'entends bien, et l'image est nette aussi.","Parfait, passons en revue le plan.","D'accord, je t'envoie d'abord les points clés.","Ça marche. À très vite !"],
  ko: ["실례합니다, 가장 가까운 지하철역이 어디인가요?","저는 견과류 알레르기가 있어요.","택시를 불러 주시겠어요?","이거 얼마예요?","커피 한 잔 주세요.","화장실이 어디인가요?","저는 매운 음식을 못 먹어요.","이 주소로 가 주세요.","창가 쪽 자리가 필요해요.","여기서 신용카드로 결제할 수 있나요?","제 비행기는 몇 시에 출발하나요?","의사에게 연락할 수 있게 도와주세요.","도와주셔서 감사합니다.","이거 반품할 수 있나요?","여보세요, 지금 들리나요?","잘 들리고 화면도 선명해요.","좋아요, 계획을 함께 검토해요.","네, 먼저 요점을 보내 드릴게요.","좋아요. 곧 다시 얘기해요!"],
  de: ["Entschuldigung, wo ist die nächste U-Bahn-Station?","Ich bin gegen Nüsse allergisch.","Können Sie mir bitte ein Taxi rufen?","Wie viel kostet das?","Ich hätte gerne einen Kaffee.","Wo ist die Toilette?","Ich esse kein scharfes Essen.","Bitte bringen Sie mich zu dieser Adresse.","Ich brauche einen Platz am Fenster.","Kann ich hier mit Kreditkarte bezahlen?","Wann startet mein Flug?","Bitte helfen Sie mir, einen Arzt zu kontaktieren.","Danke für Ihre Hilfe.","Kann ich das zurückgeben?","Hallo, kannst du mich jetzt hören?","Ich höre dich gut, und das Bild ist auch klar.","Gut, gehen wir den Plan durch.","Okay, ich schicke dir zuerst die wichtigsten Punkte.","Klingt gut. Bis bald!"],
  pt: ["Com licença, onde fica a estação de metrô mais próxima?","Tenho alergia a nozes.","Pode chamar um táxi para mim, por favor?","Quanto custa isso?","Gostaria de um café, por favor.","Onde fica o banheiro?","Não como comida apimentada.","Por favor, leve-me a este endereço.","Preciso de um lugar perto da janela.","Posso pagar com cartão de crédito aqui?","A que horas o meu voo parte?","Por favor, ajude-me a contactar um médico.","Obrigado pela sua ajuda.","Posso devolver isto?","Olá, você consegue me ouvir agora?","Consigo te ouvir, e a imagem também está nítida.","Ótimo, vamos revisar o plano.","Certo, primeiro te envio os pontos principais.","Combinado. Falamos em breve!"],
  ru: ["Извините, где ближайшая станция метро?","У меня аллергия на орехи.","Вы можете вызвать для меня такси?","Сколько это стоит?","Я бы хотел чашку кофе.","Где здесь туалет?","Я не ем острую пищу.","Пожалуйста, отвезите меня по этому адресу.","Мне нужно место у окна.","Здесь можно оплатить кредитной картой?","Во сколько вылетает мой рейс?","Пожалуйста, помогите мне связаться с врачом.","Спасибо за вашу помощь.","Можно вернуть это?","Привет, ты меня сейчас слышишь?","Я тебя слышу, и картинка тоже чёткая.","Отлично, давай пройдёмся по плану.","Хорошо, сначала отправлю тебе главное.","Договорились. Скоро созвонимся!"],
  it: ["Scusi, dov'è la stazione della metropolitana più vicina?","Sono allergico alla frutta secca.","Può chiamarmi un taxi, per favore?","Quanto costa questo?","Vorrei un caffè, per favore.","Dov'è il bagno?","Non mangio cibo piccante.","Mi porti a questo indirizzo, per favore.","Ho bisogno di un posto vicino al finestrino.","Posso pagare con la carta di credito qui?","A che ora parte il mio volo?","Per favore, mi aiuti a contattare un medico.","Grazie per il suo aiuto.","Posso restituire questo?","Ciao, mi senti adesso?","Ti sento bene e anche l'immagine è nitida.","Ottimo, ripassiamo il piano.","Va bene, prima ti mando i punti chiave.","Va bene. A presto!"],
  nl: ["Pardon, waar is het dichtstbijzijnde metrostation?","Ik ben allergisch voor noten.","Kunt u een taxi voor mij bellen?","Hoeveel kost dit?","Ik zou graag een kopje koffie willen.","Waar is het toilet?","Ik eet geen pittig eten.","Brengt u mij naar dit adres, alstublieft.","Ik heb een plaats bij het raam nodig.","Kan ik hier met creditcard betalen?","Hoe laat vertrekt mijn vlucht?","Helpt u mij alstublieft om een arts te bereiken.","Bedankt voor uw hulp.","Kan ik dit retourneren?","Hallo, kun je me nu horen?","Ik kan je horen, en het beeld is ook scherp.","Mooi, laten we het plan doornemen.","Oké, ik stuur je eerst de belangrijkste punten.","Klinkt goed. Spreek je snel!"],
  pl: ["Przepraszam, gdzie jest najbliższa stacja metra?","Mam alergię na orzechy.","Czy może Pan zamówić dla mnie taksówkę?","Ile to kosztuje?","Poproszę filiżankę kawy.","Gdzie jest toaleta?","Nie jem pikantnych potraw.","Proszę zawieźć mnie pod ten adres.","Potrzebuję miejsca przy oknie.","Czy mogę tu zapłacić kartą kredytową?","O której godzinie odlatuje mój samolot?","Proszę pomóc mi skontaktować się z lekarzem.","Dziękuję za pomoc.","Czy mogę to zwrócić?","Cześć, słyszysz mnie teraz?","Słyszę cię, a obraz też jest wyraźny.","Świetnie, omówmy plan.","Dobrze, najpierw wyślę ci najważniejsze punkty.","Brzmi dobrze. Do usłyszenia wkrótce!"],
  sv: ["Ursäkta, var är närmaste tunnelbanestation?","Jag är allergisk mot nötter.","Kan du ringa en taxi åt mig?","Hur mycket kostar det här?","Jag skulle vilja ha en kopp kaffe.","Var är toaletten?","Jag äter inte stark mat.","Ta mig till den här adressen, tack.","Jag behöver en plats vid fönstret.","Kan jag betala med kreditkort här?","När avgår mitt flyg?","Hjälp mig att kontakta en läkare, tack.","Tack för din hjälp.","Kan jag lämna tillbaka det här?","Hej, hör du mig nu?","Jag hör dig, och bilden är också tydlig.","Bra, låt oss gå igenom planen.","Okej, jag skickar de viktigaste punkterna först.","Låter bra. Vi hörs snart!"],
  tr: ["Affedersiniz, en yakın metro istasyonu nerede?","Kuruyemişe alerjim var.","Benim için bir taksi çağırabilir misiniz?","Bu ne kadar?","Bir fincan kahve istiyorum.","Tuvalet nerede?","Acı yemek yemiyorum.","Lütfen beni bu adrese götürün.","Pencere kenarında bir yere ihtiyacım var.","Burada kredi kartı ile ödeyebilir miyim?","Uçağım saat kaçta kalkıyor?","Lütfen bir doktorla iletişime geçmeme yardım edin.","Yardımınız için teşekkür ederim.","Bunu iade edebilir miyim?","Merhaba, beni şimdi duyabiliyor musun?","Sizi duyabiliyorum, görüntü de net.","Harika, planı gözden geçirelim.","Tamam, önce önemli noktaları sana göndereyim.","Kulağa hoş geliyor. Yakında görüşürüz!"],
  id: ["Permisi, di mana stasiun kereta bawah tanah terdekat?","Saya alergi terhadap kacang.","Bisakah Anda memanggilkan taksi untuk saya?","Berapa harga ini?","Saya ingin secangkir kopi.","Di mana kamar kecil?","Saya tidak makan makanan pedas.","Tolong antarkan saya ke alamat ini.","Saya perlu kursi di dekat jendela.","Bisakah saya membayar dengan kartu kredit di sini?","Jam berapa penerbangan saya berangkat?","Tolong bantu saya menghubungi dokter.","Terima kasih atas bantuan Anda.","Bisakah saya mengembalikan ini?","Halo, apakah kamu bisa mendengarku sekarang?","Aku bisa mendengarmu, dan gambarnya juga jernih.","Bagus, mari kita bahas rencananya.","Baik, aku kirimkan dulu poin-poin pentingnya.","Kedengarannya bagus. Sampai jumpa lagi!"],
  ms: ["Maaf, di manakah stesen kereta api bawah tanah yang terdekat?","Saya alah kepada kekacang.","Bolehkah anda memanggil teksi untuk saya?","Berapa harga ini?","Saya mahu secawan kopi.","Di manakah tandas?","Saya tidak makan makanan pedas.","Tolong hantar saya ke alamat ini.","Saya perlu tempat duduk di sebelah tingkap.","Bolehkah saya membayar dengan kad kredit di sini?","Pukul berapa penerbangan saya berlepas?","Tolong bantu saya menghubungi doktor.","Terima kasih atas bantuan anda.","Bolehkah saya memulangkan ini?","Hello, bolehkah anda mendengar saya sekarang?","Saya boleh mendengar anda, dan gambarnya juga jelas.","Bagus, mari kita semak pelan itu.","Baiklah, saya hantar poin penting dahulu.","Bunyi bagus. Jumpa lagi nanti!"],
  th: ["ขอโทษนะคะ สถานีรถไฟฟ้าที่ใกล้ที่สุดอยู่ที่ไหน?","ฉันแพ้ถั่ว","ช่วยเรียกแท็กซี่ให้ฉันหน่อยได้ไหม?","อันนี้ราคาเท่าไหร่?","ฉันขอกาแฟหนึ่งแก้ว","ห้องน้ำอยู่ที่ไหน?","ฉันไม่กินเผ็ด","กรุณาพาฉันไปยังที่อยู่นี้","ฉันต้องการที่นั่งริมหน้าต่าง","ที่นี่ใช้บัตรเครดิตได้ไหม?","เที่ยวบินของฉันออกกี่โมง?","กรุณาช่วยติดต่อแพทย์ให้ฉัน","ขอบคุณสำหรับความช่วยเหลือ","ฉันสามารถคืนของนี้ได้ไหม?","สวัสดี ได้ยินฉันไหมตอนนี้?","ได้ยินแล้ว ภาพก็ชัดด้วย","ดีเลย มาทบทวนแผนกัน","ได้เลย เดี๋ยวส่งประเด็นสำคัญให้ก่อน","ฟังดูดี แล้วค่อยคุยกันใหม่นะ!"],
  vi: ["Xin lỗi, ga tàu điện ngầm gần nhất ở đâu?","Tôi bị dị ứng với các loại hạt.","Bạn có thể gọi giúp tôi một chiếc taxi không?","Cái này giá bao nhiêu?","Tôi muốn một tách cà phê.","Nhà vệ sinh ở đâu?","Tôi không ăn đồ cay.","Vui lòng đưa tôi đến địa chỉ này.","Tôi cần một chỗ ngồi cạnh cửa sổ.","Ở đây có thể thanh toán bằng thẻ tín dụng không?","Chuyến bay của tôi cất cánh lúc mấy giờ?","Vui lòng giúp tôi liên hệ với bác sĩ.","Cảm ơn bạn đã giúp đỡ.","Tôi có thể trả lại món này không?","Xin chào, bạn có nghe thấy tôi bây giờ không?","Tôi nghe được, hình ảnh cũng rõ nữa.","Tuyệt, chúng ta cùng xem lại kế hoạch nhé.","Được, để tôi gửi trước những điểm chính cho bạn.","Nghe hay đấy. Hẹn gặp lại sớm nhé!"],
  ar: ["عفواً، أين أقرب محطة مترو؟","لدي حساسية من المكسرات.","هل يمكنك أن تطلب لي سيارة أجرة؟","كم سعر هذا؟","أريد فنجاناً من القهوة.","أين الحمام؟","لا آكل الطعام الحار.","من فضلك، أوصلني إلى هذا العنوان.","أحتاج إلى مقعد بجانب النافذة.","هل يمكنني الدفع ببطاقة الائتمان هنا؟","متى تقلع رحلتي؟","من فضلك ساعدني في الاتصال بطبيب.","شكراً لمساعدتك.","هل يمكنني إرجاع هذا؟","مرحباً، هل تسمعني الآن؟","أسمعك، والصورة واضحة أيضاً.","رائع، لنراجع الخطة.","حسناً، سأرسل لك النقاط المهمة أولاً.","يبدو جيداً. أتحدث معك قريباً!"],
  hi: ["माफ़ कीजिए, सबसे नज़दीक मेट्रो स्टेशन कहाँ है?","मुझे नट्स से एलर्जी है।","क्या आप मेरे लिए टैक्सी बुला सकते हैं?","यह कितने का है?","मुझे एक कप कॉफ़ी चाहिए।","शौचालय कहाँ है?","मैं तीखा खाना नहीं खाता।","कृपया मुझे इस पते पर ले चलिए।","मुझे खिड़की के पास सीट चाहिए।","क्या मैं यहाँ क्रेडिट कार्ड से भुगतान कर सकता हूँ?","मेरी फ़्लाइट कितने बजे रवाना होगी?","कृपया डॉक्टर से संपर्क करने में मेरी मदद कीजिए।","आपकी मदद के लिए धन्यवाद।","क्या मैं इसे वापस कर सकता हूँ?","नमस्ते, क्या तुम्हें अब मेरी आवाज़ आ रही है?","मैं सुन सकता हूँ, और वीडियो भी साफ़ है।","बहुत अच्छा, चलिए योजना पर चर्चा करें।","ठीक है, मैं पहले मुख्य बिंदु भेज देता हूँ।","अच्छा लगता है। जल्दी बात करेंगे!"],
}

/**
 * 观影模式台词库：14 条，下标即互译关系（与 sentences 同构）。
 * 0-9 剧情（电影 / 剧集），10-11 网课，12-13 直播。
 * 源语言取 watchLines[影片语言]，译文取 watchLines[字幕语言] 的同一条，
 * 因此任意语言对都能得到干净的双语字幕。
 */
export const watchLines: Record<LangId, string[]> = {
  zh: ["你能相信吗？我们真的做到了。", "看那边——我从没见过这样的景象。", "我一直害怕这一天会来。", "我们没有多少时间了，必须马上走。", "谢谢你一直陪在我身边。", "别担心，一切都会好起来的。", "这背后一定有人在操纵。", "答应我，无论发生什么都要继续前进。", "这就是我们一直在寻找的地方。", "有人来了，快躲起来。", "今天我们来学习神经网络的基本原理。", "让我们用一个简单的例子来演示。", "欢迎来到今天的直播，很高兴见到大家。", "别忘了订阅频道，我们下周见。"],
  en: ["Can you believe it? We actually made it.", "Look over there — I've never seen anything like it.", "I've been afraid this day would come.", "We don't have much time, we have to leave now.", "Thank you for staying by my side.", "Don't worry, everything will be alright.", "Someone must be pulling the strings behind this.", "Promise me you'll keep going, no matter what happens.", "This is the place we've been searching for.", "Someone's coming — hide, quickly.", "Today we'll learn the basics of neural networks.", "Let's walk through a simple example.", "Welcome to today's livestream, great to see you all.", "Don't forget to subscribe, see you next week."],
  es: ["¿Puedes creerlo? De verdad lo logramos.", "Mira allí: nunca había visto algo así.", "Siempre temí que llegara este día.", "No tenemos mucho tiempo, debemos irnos ya.", "Gracias por quedarte a mi lado.", "No te preocupes, todo saldrá bien.", "Alguien debe estar moviendo los hilos detrás de esto.", "Prométeme que seguirás adelante, pase lo que pase.", "Este es el lugar que llevábamos buscando.", "Alguien viene: escóndete rápido.", "Hoy aprenderemos los fundamentos de las redes neuronales.", "Veamos un ejemplo sencillo.", "Bienvenidos a la transmisión de hoy, me alegra verlos.", "No olvides suscribirte, nos vemos la próxima semana."],
  ja: ["信じられる？本当にやり遂げたよ。", "あそこを見て。こんな光景は初めてだ。", "この日が来るのがずっと怖かった。", "時間がない、今すぐ出発しなきゃ。", "ずっとそばにいてくれてありがとう。", "心配しないで、きっと大丈夫だから。", "裏で誰かが操っているに違いない。", "何があっても進み続けると約束して。", "ここが私たちが探していた場所だ。", "誰か来る、早く隠れて。", "今日はニューラルネットワークの基礎を学びます。", "簡単な例で実際に確認してみましょう。", "今日の配信へようこそ。お会いできて嬉しいです。", "チャンネル登録をお忘れなく。また来週。"],
  fr: ["Tu y crois ? On a vraiment réussi.", "Regarde là-bas — je n'ai jamais rien vu de tel.", "J'ai toujours craint que ce jour n'arrive.", "Nous n'avons plus beaucoup de temps, il faut partir maintenant.", "Merci d'être resté à mes côtés.", "Ne t'inquiète pas, tout ira bien.", "Quelqu'un doit tirer les ficelles derrière tout ça.", "Promets-moi de continuer, quoi qu'il arrive.", "C'est l'endroit que nous cherchions depuis longtemps.", "Quelqu'un arrive — cache-toi, vite.", "Aujourd'hui, nous allons découvrir les bases des réseaux de neurones.", "Voyons cela avec un exemple simple.", "Bienvenue au direct d'aujourd'hui, ravi de vous voir.", "N'oubliez pas de vous abonner, à la semaine prochaine."],
  ko: ["믿을 수 있어? 우리 정말 해냈어.", "저기를 봐. 이런 광경은 처음이야.", "이날이 올까 봐 늘 두려웠어.", "시간이 많지 않아, 당장 떠나야 해.", "내 곁에 있어 줘서 고마워.", "걱정 마, 다 잘될 거야.", "누군가 뒤에서 조종하고 있음이 틀림없어.", "무슨 일이 있어도 계속 나아가겠다고 약속해 줘.", "여기가 우리가 찾던 곳이야.", "누군가 온다, 빨리 숨어.", "오늘은 신경망의 기본 원리를 배워 봅시다.", "간단한 예제로 함께 확인해 보죠.", "오늘 방송에 오신 것을 환영합니다, 반갑습니다.", "구독 잊지 마세요, 다음 주에 뵙겠습니다."],
  de: ["Kannst du das glauben? Wir haben es wirklich geschafft.", "Schau dort hinüber — so etwas habe ich noch nie gesehen.", "Ich hatte immer Angst, dass dieser Tag kommt.", "Wir haben nicht mehr viel Zeit, wir müssen jetzt gehen.", "Danke, dass du an meiner Seite geblieben bist.", "Keine Sorge, alles wird gut.", "Irgendjemand muss hier die Fäden in der Hand halten.", "Versprich mir, dass du weitermachst, was auch passiert.", "Das ist der Ort, den wir so lange gesucht haben.", "Jemand kommt — versteck dich, schnell.", "Heute lernen wir die Grundlagen neuronaler Netze.", "Schauen wir uns das an einem einfachen Beispiel an.", "Willkommen zum heutigen Livestream, schön, euch zu sehen.", "Vergiss nicht zu abonnieren, bis nächste Woche."],
  pt: ["Você acredita? Nós realmente conseguimos.", "Olhe ali — nunca vi nada parecido.", "Sempre tive medo de que este dia chegasse.", "Não temos muito tempo, precisamos ir agora.", "Obrigado por ficar ao meu lado.", "Não se preocupe, tudo vai ficar bem.", "Alguém deve estar por trás de tudo isso.", "Prometa que vai continuar, aconteça o que acontecer.", "Este é o lugar que procurávamos há tanto tempo.", "Alguém está vindo — esconda-se, rápido.", "Hoje vamos aprender os princípios das redes neurais.", "Vamos ver isso com um exemplo simples.", "Bem-vindos à transmissão de hoje, que bom ver vocês.", "Não esqueça de se inscrever, até a próxima semana."],
  ru: ["Ты можешь в это поверить? Мы действительно это сделали.", "Посмотри туда — я никогда не видел ничего подобного.", "Я всегда боялся, что этот день наступит.", "У нас мало времени, нужно уходить сейчас.", "Спасибо, что остался рядом со мной.", "Не волнуйся, всё будет хорошо.", "Кто-то должен управлять всем этим из-за кулис.", "Обещай мне, что продолжишь, что бы ни случилось.", "Это то место, которое мы так долго искали.", "Кто-то идёт — спрячься быстрее.", "Сегодня мы изучим основы нейронных сетей.", "Давайте разберём это на простом примере.", "Добро пожаловать на сегодняшний эфир, рад вас видеть.", "Не забудьте подписаться, до встречи на следующей неделе."],
  it: ["Ci credi? Ce l'abbiamo davvero fatta.", "Guarda laggiù — non ho mai visto niente di simile.", "Ho sempre avuto paura che arrivasse questo giorno.", "Non abbiamo molto tempo, dobbiamo andare subito.", "Grazie per essere rimasto al mio fianco.", "Non preoccuparti, andrà tutto bene.", "Qualcuno deve muovere i fili dietro tutto questo.", "Promettimi che andrai avanti, qualunque cosa accada.", "Questo è il posto che cercavamo da così tanto tempo.", "Sta arrivando qualcuno — nasconditi, in fretta.", "Oggi impareremo i principi di base delle reti neurali.", "Vediamolo con un esempio semplice.", "Benvenuti alla diretta di oggi, felice di vedervi.", "Non dimenticare di iscriverti, ci vediamo la prossima settimana."],
  nl: ["Kun je het geloven? We hebben het echt gehaald.", "Kijk daar — zoiets heb ik nog nooit gezien.", "Ik was altijd bang dat deze dag zou komen.", "We hebben niet veel tijd, we moeten nu gaan.", "Dank je dat je aan mijn zijde bent gebleven.", "Maak je geen zorgen, alles komt goed.", "Iemand moet hierachter de touwtjes in handen hebben.", "Beloof me dat je doorgaat, wat er ook gebeurt.", "Dit is de plek die we al die tijd zochten.", "Er komt iemand aan — verstop je, snel.", "Vandaag leren we de basis van neurale netwerken.", "Laten we dat met een eenvoudig voorbeeld bekijken.", "Welkom bij de livestream van vandaag, fijn jullie te zien.", "Vergeet niet je te abonneren, tot volgende week."],
  pl: ["Wierzysz? Naprawdę nam się udało.", "Spójrz tam — nigdy nie widziałem czegoś takiego.", "Zawsze bałem się, że ten dzień nadejdzie.", "Nie mamy dużo czasu, musimy iść już teraz.", "Dziękuję, że zostałeś przy mnie.", "Nie martw się, wszystko będzie dobrze.", "Ktoś musi za tym wszystkim pociągać za sznurki.", "Obiecaj mi, że będziesz szedł dalej, cokolwiek się stanie.", "To jest miejsce, którego szukaliśmy od tak dawna.", "Ktoś idzie — ukryj się, szybko.", "Dziś poznamy podstawy sieci neuronowych.", "Zobaczmy to na prostym przykładzie.", "Witajcie na dzisiejszej transmisji, miło was widzieć.", "Nie zapomnij subskrybować, do zobaczenia w przyszłym tygodniu."],
  sv: ["Kan du tro det? Vi klarade det faktiskt.", "Titta där borta — jag har aldrig sett något liknande.", "Jag har alltid varit rädd för att den här dagen skulle komma.", "Vi har inte mycket tid, vi måste gå nu.", "Tack för att du stannade vid min sida.", "Oroa dig inte, allt kommer att bli bra.", "Någon måste dra i trådarna bakom allt detta.", "Lova mig att du fortsätter, vad som än händer.", "Det här är platsen vi har letat efter så länge.", "Någon kommer — göm dig, snabbt.", "Idag lär vi oss grunderna i neurala nätverk.", "Låt oss titta på det med ett enkelt exempel.", "Välkomna till dagens direktsändning, roligt att se er.", "Glöm inte att prenumerera, vi ses nästa vecka."],
  tr: ["İnanabiliyor musun? Gerçekten başardık.", "Şuraya bak — böyle bir şey hiç görmedim.", "Bu günün geleceğinden hep korktum.", "Fazla vaktimiz yok, şimdi gitmeliyiz.", "Yanımda kaldığın için teşekkür ederim.", "Endişelenme, her şey yoluna girecek.", "Bunun arkasında biri ipi çekiyor olmalı.", "Ne olursa olsun devam edeceğine söz ver.", "Aradığımız yer tam olarak burası.", "Biri geliyor — çabuk saklan.", "Bugün sinir ağlarının temellerini öğreneceğiz.", "Bunu basit bir örnekle görelim.", "Bugünkü canlı yayına hoş geldiniz, hepinizi görmek güzel.", "Abone olmayı unutmayın, gelecek hafta görüşürüz."],
  id: ["Kamu percaya? Kita benar-benar berhasil.", "Lihat ke sana — aku belum pernah melihat yang seperti ini.", "Aku selalu takut hari ini akan datang.", "Waktu kita tidak banyak, kita harus pergi sekarang.", "Terima kasih sudah tetap di sisiku.", "Jangan khawatir, semuanya akan baik-baik saja.", "Pasti ada seseorang yang mengatur semuanya di balik ini.", "Berjanjilah kamu akan terus maju, apa pun yang terjadi.", "Inilah tempat yang sudah lama kita cari.", "Ada yang datang — cepat bersembunyi.", "Hari ini kita akan mempelajari dasar jaringan saraf.", "Mari kita lihat dengan contoh sederhana.", "Selamat datang di siaran langsung hari ini, senang bertemu kalian.", "Jangan lupa berlangganan, sampai jumpa minggu depan."],
  ms: ["Kamu percaya? Kita benar-benar berjaya.", "Lihat ke sana — saya belum pernah melihat yang begini.", "Saya selalu takut hari ini akan tiba.", "Kita tidak ada banyak masa, kita mesti pergi sekarang.", "Terima kasih kerana kekal di sisi saya.", "Jangan risau, semuanya akan baik-baik saja.", "Mesti ada seseorang yang mengatur semuanya di sebalik ini.", "Berjanjilah kamu akan terus maju, apa pun yang berlaku.", "Inilah tempat yang lama kita cari.", "Ada orang datang — cepat bersembunyi.", "Hari ini kita akan belajar asas rangkaian neural.", "Mari kita lihat dengan contoh mudah.", "Selamat datang ke siaran langsung hari ini, gembira bertemu kalian.", "Jangan lupa melanggan, jumpa lagi minggu depan."],
  th: ["เชื่อไหม? เราทำสำเร็จจริง ๆ", "ดูทางนั้นสิ — ฉันไม่เคยเห็นอะไรแบบนี้มาก่อน", "ฉันกลัวมาตลอดว่าวันนี้จะมาถึง", "เราไม่มีเวลามาก ต้องไปเดี๋ยวนี้", "ขอบคุณที่อยู่ข้างฉันมาตลอด", "ไม่ต้องห่วง ทุกอย่างจะต้องดีเอง", "ต้องมีใครบางคนอยู่เบื้องหลังเรื่องนี้แน่ ๆ", "สัญญานะว่าจะเดินต่อไป ไม่ว่าจะเกิดอะไรขึ้น", "นี่คือสถานที่ที่เราค้นหามาตลอด", "มีคนมา — รีบซ่อนตัวเร็ว", "วันนี้เราจะเรียนรู้พื้นฐานของโครงข่ายประสาทเทียม", "ลองดูด้วยตัวอย่างง่าย ๆ กัน", "ยินดีต้อนรับสู่ไลฟ์สดวันนี้ ดีใจที่ได้พบทุกคน", "อย่าลืมกดติดตาม แล้วพบกันสัปดาห์หน้า"],
  vi: ["Bạn có tin không? Chúng ta thực sự đã làm được.", "Nhìn kìa — tôi chưa từng thấy điều gì như thế này.", "Tôi luôn sợ rằng ngày này sẽ đến.", "Chúng ta không còn nhiều thời gian, phải đi ngay bây giờ.", "Cảm ơn bạn đã luôn ở bên cạnh tôi.", "Đừng lo, mọi chuyện rồi sẽ ổn thôi.", "Chắc chắn có ai đó đang giật dây phía sau chuyện này.", "Hứa với tôi rằng bạn sẽ tiếp tục, bất kể điều gì xảy ra.", "Đây chính là nơi chúng ta đã tìm kiếm bấy lâu.", "Có người đang đến — trốn nhanh lên.", "Hôm nay chúng ta sẽ học những nguyên lý cơ bản của mạng nơ-ron.", "Hãy cùng xem qua một ví dụ đơn giản.", "Chào mừng đến với buổi phát trực tiếp hôm nay, rất vui được gặp mọi người.", "Đừng quên đăng ký kênh, hẹn gặp lại vào tuần sau."],
  ar: ["هل يمكنك تصديق ذلك؟ لقد نجحنا بالفعل.", "انظر إلى هناك — لم أرَ شيئاً مثل هذا من قبل.", "لطالما خشيت أن يأتي هذا اليوم.", "لم يتبقَّ لنا وقت كثير، يجب أن نغادر الآن.", "شكراً لك لأنك بقيت بجانبي.", "لا تقلق، كل شيء سيكون على ما يرام.", "لا بد أن هناك من يحرك الخيوط من وراء هذا.", "اعدني بأنك ستواصل، مهما حدث.", "هذا هو المكان الذي كنا نبحث عنه طوال الوقت.", "هناك شخص قادم — اختبئ بسرعة.", "اليوم سنتعلم أساسيات الشبكات العصبية.", "لنرَ ذلك من خلال مثال بسيط.", "مرحباً بكم في البث المباشر اليوم، سعيد برؤيتكم.", "لا تنسَ الاشتراك في القناة، أراكم الأسبوع القادم."],
  hi: ["क्या तुम विश्वास कर सकते हो? हमने सच में कर दिखाया।", "वहाँ देखो — मैंने ऐसा कभी नहीं देखा।", "मुझे हमेशा डर था कि यह दिन आएगा।", "हमारे पास ज़्यादा समय नहीं है, हमें अभी जाना होगा।", "मेरे साथ रहने के लिए धन्यवाद।", "चिंता मत करो, सब ठीक हो जाएगा।", "इसके पीछे कोई न कोई तो पर चला रहा है।", "वादा करो कि तुम चलते रहोगे, चाहे कुछ भी हो।", "यही वह जगह है जिसे हम बहुत समय से ढूँढ रहे थे।", "कोई आ रहा है — जल्दी छुप जाओ।", "आज हम न्यूरल नेटवर्क की बुनियादी बातें सीखेंगे।", "इसे एक सरल उदाहरण से समझते हैं।", "आज की लाइव स्ट्रीम में आपका स्वागत है, आप सबसे मिलकर अच्छा लगा।", "चैनल को सब्सक्राइब करना न भूलें, अगले सप्ताह मिलते हैं।"],
}

/** 影片类型 → 台词下标区间；换类型即换剧本，不同来源互不串味 */
export const watchScripts: Record<string, number[]> = {
  movie: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  series: [4, 5, 2, 6, 0, 9, 1, 7],
  class: [10, 11, 10, 11],
  live: [12, 13, 12, 13],
}

/** 词级词典：下标一致即可互译，句级未命中时按词拼接 */
const words: Record<LangId, string[]> = {
  zh: ["地铁","机场","酒店","车站","医院","餐厅","菜单","发票","行李","护照","出租车","请问","谢谢","你好","再见","多少钱","在哪里","可以","帮助","今天","明天","小时","分钟","左","右","水","咖啡","面包","房间","网络"],
  en: ["subway","airport","hotel","station","hospital","restaurant","menu","receipt","luggage","passport","taxi","excuse me","thank you","hello","goodbye","how much","where is","can","help","today","tomorrow","hour","minute","left","right","water","coffee","bread","room","internet"],
  es: ["metro","aeropuerto","hotel","estación","hospital","restaurante","menú","factura","equipaje","pasaporte","taxi","perdón","gracias","hola","adiós","cuánto","dónde está","puede","ayuda","hoy","mañana","hora","minuto","izquierda","derecha","agua","café","pan","habitación","internet"],
  ja: ["地下鉄","空港","ホテル","駅","病院","レストラン","メニュー","領収書","荷物","パスポート","タクシー","すみません","ありがとう","こんにちは","さようなら","いくら","どこ","できます","助けて","今日","明日","時間","分","左","右","水","コーヒー","パン","部屋","ネット"],
  fr: ["métro","aéroport","hôtel","gare","hôpital","restaurant","menu","reçu","bagages","passeport","taxi","excusez-moi","merci","bonjour","au revoir","combien","où est","peut","aide","aujourd'hui","demain","heure","minute","gauche","droite","eau","café","pain","chambre","internet"],
  ko: ["지하철","공항","호텔","역","병원","식당","메뉴","영수증","짐","여권","택시","실례합니다","감사합니다","안녕하세요","안녕히 가세요","얼마","어디","할 수","도움","오늘","내일","시간","분","왼쪽","오른쪽","물","커피","빵","방","인터넷"],
  de: ["U-Bahn","Flughafen","Hotel","Bahnhof","Krankenhaus","Restaurant","Speisekarte","Quittung","Gepäck","Reisepass","Taxi","Entschuldigung","danke","hallo","auf Wiedersehen","wie viel","wo ist","kann","Hilfe","heute","morgen","Stunde","Minute","links","rechts","Wasser","Kaffee","Brot","Zimmer","Internet"],
  pt: ["metrô","aeroporto","hotel","estação","hospital","restaurante","cardápio","recibo","bagagem","passaporte","táxi","com licença","obrigado","olá","adeus","quanto","onde fica","pode","ajuda","hoje","amanhã","hora","minuto","esquerda","direita","água","café","pão","quarto","internet"],
  ru: ["метро","аэропорт","отель","вокзал","больница","ресторан","меню","чек","багаж","паспорт","такси","извините","спасибо","здравствуйте","до свидания","сколько","где","можно","помощь","сегодня","завтра","час","минута","налево","направо","вода","кофе","хлеб","номер","интернет"],
  it: ["metropolitana","aeroporto","hotel","stazione","ospedale","ristorante","menu","ricevuta","bagaglio","passaporto","taxi","scusi","grazie","ciao","arrivederci","quanto","dov'è","può","aiuto","oggi","domani","ora","minuto","sinistra","destra","acqua","caffè","pane","camera","internet"],
  nl: ["metro","luchthaven","hotel","station","ziekenhuis","restaurant","menu","bon","bagage","paspoort","taxi","pardon","dank u","hallo","tot ziens","hoeveel","waar is","kan","hulp","vandaag","morgen","uur","minuut","links","rechts","water","koffie","brood","kamer","internet"],
  pl: ["metro","lotnisko","hotel","dworzec","szpital","restauracja","menu","paragon","bagaż","paszport","taksówka","przepraszam","dziękuję","cześć","do widzenia","ile","gdzie jest","można","pomoc","dzisiaj","jutro","godzina","minuta","lewo","prawo","woda","kawa","chleb","pokój","internet"],
  sv: ["tunnelbana","flygplats","hotell","station","sjukhus","restaurang","meny","kvitto","bagage","pass","taxi","ursäkta","tack","hej","hej då","hur mycket","var är","kan","hjälp","idag","imorgon","timme","minut","vänster","höger","vatten","kaffe","bröd","rum","internet"],
  tr: ["metro","havalimanı","otel","istasyon","hastane","restoran","menü","fiş","bagaj","pasaport","taksi","affedersiniz","teşekkürler","merhaba","hoşça kalın","ne kadar","nerede","olur","yardım","bugün","yarın","saat","dakika","sol","sağ","su","kahve","ekmek","oda","internet"],
  id: ["kereta bawah tanah","bandara","hotel","stasiun","rumah sakit","restoran","menu","struk","bagasi","paspor","taksi","permisi","terima kasih","halo","selamat tinggal","berapa","di mana","bisa","bantuan","hari ini","besok","jam","menit","kiri","kanan","air","kopi","roti","kamar","internet"],
  ms: ["kereta api bawah tanah","lapangan terbang","hotel","stesen","hospital","restoran","menu","resit","bagasi","pasport","teksi","maaf","terima kasih","hello","selamat tinggal","berapa","di mana","boleh","bantuan","hari ini","esok","jam","minit","kiri","kanan","air","kopi","roti","bilik","internet"],
  th: ["รถไฟฟ้า","สนามบิน","โรงแรม","สถานี","โรงพยาบาล","ร้านอาหาร","เมนู","ใบเสร็จ","กระเป๋าเดินทาง","พาสปอร์ต","แท็กซี่","ขอโทษ","ขอบคุณ","สวัสดี","ลาก่อน","เท่าไหร่","อยู่ที่ไหน","ได้","ช่วยเหลือ","วันนี้","พรุ่งนี้","ชั่วโมง","นาที","ซ้าย","ขวา","น้ำ","กาแฟ","ขนมปัง","ห้อง","อินเทอร์เน็ต"],
  vi: ["tàu điện ngầm","sân bay","khách sạn","nhà ga","bệnh viện","nhà hàng","thực đơn","hóa đơn","hành lý","hộ chiếu","taxi","xin lỗi","cảm ơn","xin chào","tạm biệt","bao nhiêu","ở đâu","có thể","giúp đỡ","hôm nay","ngày mai","giờ","phút","trái","phải","nước","cà phê","bánh mì","phòng","internet"],
  ar: ["مترو","مطار","فندق","محطة","مستشفى","مطعم","قائمة الطعام","إيصال","أمتعة","جواز سفر","سيارة أجرة","عفواً","شكراً","مرحباً","مع السلامة","كم","أين","يمكن","مساعدة","اليوم","غداً","ساعة","دقيقة","يسار","يمين","ماء","قهوة","خبز","غرفة","إنترنت"],
  hi: ["मेट्रो","हवाई अड्डा","होटल","स्टेशन","अस्पताल","रेस्टोरेंट","मेनू","रसीद","सामान","पासपोर्ट","टैक्सी","माफ़ कीजिए","धन्यवाद","नमस्ते","अलविदा","कितना","कहाँ","सकता","मदद","आज","कल","घंटा","मिनट","बायाँ","दायाँ","पानी","कॉफ़ी","ब्रेड","कमरा","इंटरनेट"],
}


export type TranslateMode = "exact" | "mixed"

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[。！？!?.,，、؟؟]/g, "")
}

/** 句级匹配：返回句表下标，未命中返回 -1 */
function matchSentence(text: string, from: LangId) {
  const key = normalize(text)
  if (!key) return -1
  const list = sentences[from]
  const exact = list.findIndex((item) => normalize(item) === key)
  if (exact >= 0) return exact
  return -1
}

/** 逐词对译：把 source 中命中的词按词表换成目标语言 */
function translateWords(source: string, from: LangId, to: LangId) {
  const pairs = words[from].map((item, index) => ({
    from: item,
    to: words[to][index] ?? "",
  }))
  const sorted = [...pairs].sort((a, b) => b.from.length - a.from.length)

  let result = source
  let hit = false
  for (const pair of sorted) {
    if (pair.from && result.includes(pair.from)) {
      result = result.split(pair.from).join(pair.to)
      hit = true
    }
  }
  return { text: result, hit }
}

/**
 * 翻译策略：优先句级词典命中（exact），否则按词级拼接（mixed）。
 * 未收录任何词时返回原文并标注需联网。
 */
export function translatePhrase(
  text: string,
  from: LangId,
  to: LangId,
): { text: string; mode: TranslateMode | "none" } {
  const input = text.trim()
  if (!input || from === to) return { text: input, mode: "none" }

  const index = matchSentence(input, from)
  if (index >= 0) return { text: sentences[to][index], mode: "exact" }

  const direct = translateWords(input, from, to)
  if (direct.hit) return { text: direct.text, mode: "mixed" }

  return { text: input, mode: "none" }
}

/** 常用语在指定语言下的译文（常用语统一以中文存储） */
export function translatePhraseOf(text: string, to: LangId) {
  const index = matchSentence(text, "zh")
  if (index >= 0) return sentences[to][index]
  return ""
}

export function langLabel(id: LangId) {
  return allLanguages.find((item) => item.id === id)?.short ?? "中文"
}

export const languageIcon = (id: LangId): IconName =>
  id === "zh" ? "translate" : "globe"

/**
 * 自动语种检测（端侧启发式，不依赖云端 ASR）：
 * 依据 Unicode 脚本范围判断文本最可能所属语言。
 * 用于「自动检测语言」开关。
 */
export function detectLang(text: string): LangId {
  const s = text.trim()
  if (!s) return "en"
  // 中日韩：先按字符特征细分
  if (/[぀-ヿ]/.test(s)) return "ja" // 平假名 / 片假名
  if (/[가-힯]/.test(s)) return "ko" // 谚文
  if (/[一-鿿]/.test(s)) return "zh" // 汉字
  if (/[Ѐ-ӿ]/.test(s)) return "ru" // 西里尔
  if (/[؀-ۿ]/.test(s)) return "ar" // 阿拉伯
  if (/[฀-๿]/.test(s)) return "th" // 泰文
  if (/[Ҁ-഻]/.test(s)) return "hi" // 天城体（印地）
  if (/[ả-囯]/.test(s)) return "vi" // 越南（带音符拉丁）
  // 拉丁字母：用少量高频词再细分几种常见语言，其余归于 en
  const lower = s.toLowerCase()
  const samples: [LangId, RegExp][] = [
    ["es", /\b(el|la|los|las|que|y|de|hola|gracias|por)\b/],
    ["fr", /\b(le|la|les|une|que|bonjour|merci|je|vous|oui)\b/],
    ["de", /\b(der|die|das|und|ich|ein|guten|danke|bitte)\b/],
    ["pt", /\b(o|a|os|as|que|sim|não|obrigado|por)\b/],
    ["it", /\b(il|la|che|e|di|grazie|buongiorno|sono)\b/],
    ["nl", /\b(de|het|een|ik|en|dank|bent|je)\b/],
    ["pl", /\b(się|i|w|na|tak|nie|dziękuję)\b/],
    ["tr", /\b(ve|bir|ben|merhaba|teşekkür|evet|hayır)\b/],
    ["id", /\b(dan|yang|di|saya|terima|kasih|dan)\b/],
    ["ms", /\b(dan|yang|saya|terima|kasih|adalah)\b/],
    ["sv", /\b(och|jag|en|att|tack|hej|ja|nej)\b/],
  ]
  for (const [lang, re] of samples) if (re.test(lower)) return lang
  return "en"
}

export type ToneId = "neutral" | "formal" | "casual"

/**
 * 语气适配：对支持的语言给少量常用句提供正式 / 随意变体，
 * 其余语言仅原样返回并交由 UI 标注所选语气（受离线词库覆盖范围限制）。
 */
const toneVariants: Record<string, { formal: string; casual: string }> = {
  "zh:请问最近的地铁站在哪里？": {
    formal: "请问，能否告知最近的地铁站怎么走？",
    casual: "最近地铁站咋走？",
  },
  "zh:谢谢你的帮助。": {
    formal: "非常感谢您的帮助。",
    casual: "谢啦！",
  },
  "zh:我可以退货吗？": {
    formal: "麻烦问下，这件商品是否可以退货？",
    casual: "这能退不？",
  },
  "en:Thank you for your help.": {
    formal: "I would like to thank you for your assistance.",
    casual: "Thanks a lot!",
  },
  "en:Can I return this?": {
    formal: "I was wondering if I might return this item.",
    casual: "Can I return this?",
  },
  "ja:ありがとう。": {
    formal: "誠にありがとうございます。",
    casual: "ありがとう！",
  },
  "ko:감사합니다。": {
    formal: "진심으로 감사합니다。",
    casual: "고마워!",
  },
  "fr:Merci pour votre aide.": {
    formal: "Je vous remercie beaucoup pour votre aide.",
    casual: "Merci !",
  },
  "de:Danke für Ihre Hilfe.": {
    formal: "Ich danke Ihnen herzlich für Ihre Hilfe.",
    casual: "Danke!",
  },
}

export function applyTone(
  text: string,
  from: LangId,
  tone: ToneId,
): string {
  if (tone === "neutral") return text
  const key = `${from}:${text}`
  const v = toneVariants[key]
  if (!v) return text
  return tone === "formal" ? v.formal : v.casual
}

export type VocabularyEntryInput = { term: string; note?: string }

/**
 * 个人词汇表接入：检测源文本中命中的个人术语，返回命中的术语列表。
 * 翻译链路会把命中的术语标注出来，提升专有名词（人名 / 地名 / 产品名）的识别与一致性。
 */
export function detectGlossary(
  source: string,
  entries: VocabularyEntryInput[],
): VocabularyEntryInput[] {
  const s = source.trim()
  if (!s) return []
  return entries.filter((entry) => {
    if (!entry.term) return false
    return s.includes(entry.term) || (entry.note ? s.includes(entry.note) : false)
  })
}
