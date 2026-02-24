import "server-only";

import { db } from "@/db";
import { conversationTurns, lessonConversations } from "@/db/schema";
import { eq, or } from "drizzle-orm";

import type { LessonConversation } from './types'

/** In-memory conversations (key = lesson ID used in URL: l1, l2, ...). */
const LESSON_CONVERSATIONS: Record<string, LessonConversation> = {
  l1: {
    id: 'conv-1',
    lessonId: 'l1',
    title: 'Airport Check-in Conversation',
    description: 'Practice checking in at the airport',
    scenario: 'Airport Check-in',
    turns: [
      { id: 't1', role: 'Officer', text: 'Hello! Welcome to check-in. May I see your passport, please?', textByLang: { 'es-ES': '¡Hola! Bienvenido al facturación. ¿Me enseña su pasaporte, por favor?', 'es-MX': '¡Hola! Bienvenido al mostrador. ¿Me muestra su pasaporte, por favor?', 'fr-FR': 'Bonjour ! Bienvenue à l\'enregistrement. Puis-je voir votre passeport, s\'il vous plaît ?', 'de-DE': 'Hallo! Willkommen zur Abfertigung. Darf ich bitte Ihren Pass sehen?', 'it-IT': 'Buongiorno! Benvenuto al check-in. Posso vedere il suo passaporto, per favore?', 'ja-JP': 'こんにちは。チェックインへようこそ。パスポートを見せていただけますか。', 'zh-CN': '您好！欢迎办理登机手续。请出示您的护照。', 'pt-BR': 'Olá! Bem-vindo ao check-in. Posso ver seu passaporte, por favor?', 'pt-PT': 'Olá! Bem-vindo ao check-in. Posso ver o seu passaporte, por favor?', 'ko-KR': '안녕하세요. 체크인에 오신 것을 환영합니다. 여권을 보여 주시겠어요?', 'ar-SA': 'مرحباً! أهلاً بك في التسجيل. هل أستطيع رؤية جواز سفرك من فضلك؟', 'hi-IN': 'नमस्ते! चेक-इन में आपका स्वागत है। क्या मैं आपका पासपोर्ट देख सकता हूँ?', 'nl-NL': 'Hallo! Welkom bij de incheckbalie. Mag ik uw paspoort zien?', 'ru-RU': 'Здравствуйте! Добро пожаловать на регистрацию. Покажите, пожалуйста, паспорт.', 'pl-PL': 'Dzień dobry! Witamy przy odprawie. Czy mogę zobaczyć pana paszport?', 'tr-TR': 'Merhaba! Check-in\'e hoş geldiniz. Pasaportunuzu görebilir miyim lütfen?', 'zh-TW': '您好！歡迎辦理登機手續。請出示您的護照。' }, romanizationByLang: { 'ar-SA': 'Marhaban! Ahlan bik fi at-tasjīl. Hal astatīʿu ruʾyata jawāz safarik min faḍlik?', 'ja-JP': 'Konnichiwa. Chekku-in e yōkoso. Pasupōto o misete itadakemasu ka?', 'zh-CN': 'Nín hǎo! Huānyíng bànlǐ dēngjī shǒuxù. Qǐng chūshì nín de hùzhào.', 'zh-TW': 'Nín hǎo! Huānyíng bànlǐ dēngjī shǒuxù. Qǐng chūshì nín de hùzhào.', 'ko-KR': 'Annyeonghaseyo. Chekeu-in-e osin geoseul hwanyeonghamnida. Yeogwon-eul boyeo jusigesseoyo?', 'hi-IN': 'Namaste! Chek-in mein aapka swagat hai. Kya main aapka paasport dekh sakta hoon?', 'ru-RU': 'Zdravstvuyte! Dobro požalovat\' na registraciyu. Pokazhite, požaluysta, pasport.' }, order: 0 },
      { id: 't2', role: 'Passenger', text: 'Hello. Yes, here it is.', textByLang: { 'es-ES': 'Hola. Sí, aquí está.', 'es-MX': 'Hola. Sí, aquí está.', 'fr-FR': 'Bonjour. Oui, le voici.', 'de-DE': 'Hallo. Ja, hier ist er.', 'it-IT': 'Buongiorno. Sì, eccolo.', 'ja-JP': 'こんにちは。はい、こちらです。', 'zh-CN': '您好。好的，给您。', 'pt-BR': 'Olá. Sim, aqui está.', 'pt-PT': 'Olá. Sim, aqui está.', 'ko-KR': '안녕하세요. 네, 여기 있습니다.', 'ar-SA': 'مرحباً. نعم، هذا هو.', 'hi-IN': 'नमस्ते। हाँ, यह रहा।', 'nl-NL': 'Hallo. Ja, hier is die.', 'ru-RU': 'Здравствуйте. Да, вот он.', 'pl-PL': 'Dzień dobry. Tak, proszę.', 'tr-TR': 'Merhaba. Evet, işte burada.', 'zh-TW': '您好。好的，在這裡。' }, romanizationByLang: { 'ar-SA': 'Marhaban. Naʿam, hādhā huwa.', 'ja-JP': 'Konnichiwa. Hai, kochira desu.', 'zh-CN': 'Nín hǎo. Hǎo de, gěi nín.', 'zh-TW': 'Nín hǎo. Hǎo de, zài zhèlǐ.', 'ko-KR': 'Annyeonghaseyo. Ne, yeogi itseumnida.', 'hi-IN': 'Namaste. Haan, yah raha.', 'ru-RU': 'Zdravstvuyte. Da, vot on.' }, order: 1 },
      { id: 't3', role: 'Officer', text: 'Thank you. Do you have any bags to check?', textByLang: { 'es-ES': 'Gracias. ¿Tiene equipaje para facturar?', 'es-MX': 'Gracias. ¿Tiene equipaje para documentar?', 'fr-FR': 'Merci. Avez-vous des bagages à enregistrer ?', 'de-DE': 'Danke. Haben Sie Gepäck zur Aufgabe?', 'it-IT': 'Grazie. Ha bagagli da imbarcare?', 'ja-JP': 'ありがとうございます。預ける荷物はありますか。', 'zh-CN': '谢谢。您有需要托运的行李吗？', 'pt-BR': 'Obrigado. Você tem bagagem para despachar?', 'pt-PT': 'Obrigado. Tem bagagem para enviar?', 'ko-KR': '감사합니다. 위탁 수하물이 있으신가요?', 'ar-SA': 'شكراً. هل لديك أمتعة للشحن؟', 'hi-IN': 'धन्यवाद। क्या आपके पास चेक करने के लिए सामान है?', 'nl-NL': 'Dank u. Heeft u bagage om in te checken?', 'ru-RU': 'Спасибо. У вас есть багаж для сдачи?', 'pl-PL': 'Dziękuję. Czy ma pan bagaż do nadania?', 'tr-TR': 'Teşekkürler. Teslim edilecek bagajınız var mı?', 'zh-TW': '謝謝。您有需要託運的行李嗎？' }, romanizationByLang: { 'ar-SA': 'Shukran. Hal ladayka amtiʿa lil-shahn?', 'ja-JP': 'Arigatō gozaimasu. Azukeru nimotsu wa arimasu ka?', 'zh-CN': 'Xièxiè. Nín yǒu xūyào tuōyùn de xínglǐ ma?', 'zh-TW': 'Xièxiè. Nín yǒu xūyào tuōyùn de xínglǐ ma?', 'ko-KR': 'Gamsahamnida. Witak suhamuri ga iseungayo?', 'hi-IN': 'Dhanyavaad. Kya aapke paas check karne ke liye samaan hai?', 'ru-RU': 'Spasibo. U vas yest\' bagazh dlya sdachi?' }, order: 2 },
      { id: 't4', role: 'Passenger', text: 'Yes, I have one suitcase.', textByLang: { 'es-ES': 'Sí, tengo una maleta.', 'es-MX': 'Sí, tengo una maleta.', 'fr-FR': 'Oui, j\'ai une valise.', 'de-DE': 'Ja, ich habe einen Koffer.', 'it-IT': 'Sì, ho una valigia.', 'ja-JP': 'はい、スーツケースが一つあります。', 'zh-CN': '有的，我有一个行李箱。', 'pt-BR': 'Sim, tenho uma mala.', 'pt-PT': 'Sim, tenho uma mala.', 'ko-KR': '네, 가방 하나 있습니다.', 'ar-SA': 'نعم، لدي حقيبة واحدة.', 'hi-IN': 'हाँ, मेरे पास एक सूटकेस है।', 'nl-NL': 'Ja, ik heb één koffer.', 'ru-RU': 'Да, у меня один чемодан.', 'pl-PL': 'Tak, mam jedną walizkę.', 'tr-TR': 'Evet, bir bavulum var.', 'zh-TW': '有的，我有一個行李箱。' }, romanizationByLang: { 'ar-SA': 'Naʿam, laday ḥaqība wāḥida.', 'ja-JP': 'Hai, sūtsukēsu ga hitotsu arimasu.', 'zh-CN': 'Yǒu de, wǒ yǒu yī gè xínglǐxiāng.', 'zh-TW': 'Yǒu de, wǒ yǒu yī gè xínglǐxiāng.', 'ko-KR': 'Ne, gabang hana itseumnida.', 'hi-IN': 'Haan, mere paas ek suitcase hai.', 'ru-RU': 'Da, u menya odin chemodan.' }, order: 3 },
      { id: 't5', role: 'Officer', text: 'Please place your suitcase on the scale.', textByLang: { 'es-ES': 'Por favor, ponga su maleta en la báscula.', 'es-MX': 'Por favor, ponga su maleta en la báscula.', 'fr-FR': 'Veuillez poser votre valise sur la balance.', 'de-DE': 'Bitte stellen Sie Ihren Koffer auf die Waage.', 'it-IT': 'Per favore, metta la valigia sulla bilancia.', 'ja-JP': 'スーツケースをスケールに載せてください。', 'zh-CN': '请把您的行李箱放在秤上。', 'pt-BR': 'Por favor, coloque sua mala na balança.', 'pt-PT': 'Por favor, coloque a sua mala na balança.', 'ko-KR': '가방을 저울 위에 올려 주세요.', 'ar-SA': 'من فضلك ضع حقيبتك على الميزان.', 'hi-IN': 'कृपया अपना सूटकेस तराजू पर रखें।', 'nl-NL': 'Plaats uw koffer alstublieft op de weegschaal.', 'ru-RU': 'Пожалуйста, поставьте чемодан на весы.', 'pl-PL': 'Proszę położyć walizkę na wadze.', 'tr-TR': 'Lütfen bavulunuzu tartıya koyun.', 'zh-TW': '請把您的行李箱放在秤上。' }, romanizationByLang: { 'ar-SA': 'Min faḍlik ḍaʿ ḥaqībatak ʿalā al-mīzān.', 'ja-JP': 'Sūtsukēsu o sukēru ni nosete kudasai.', 'zh-CN': 'Qǐng bǎ nín de xínglǐxiāng fàng zài chèng shàng.', 'zh-TW': 'Qǐng bǎ nín de xínglǐxiāng fàng zài chèng shàng.', 'ko-KR': 'Gabang-eul jeoul wi-e ollyeo juseyo.', 'hi-IN': 'Kripaya apna suitcase taraju par rakhen.', 'ru-RU': 'Pozhaluysta, postavte chemodan na vesy.' }, order: 4 },
      { id: 't6', role: 'Passenger', text: 'Okay, here you go.', textByLang: { 'es-ES': 'Vale, aquí tiene.', 'es-MX': 'De acuerdo, aquí está.', 'fr-FR': 'D\'accord, voilà.', 'de-DE': 'Okay, bitte sehr.', 'it-IT': 'Va bene, ecco.', 'ja-JP': 'はい、どうぞ。', 'zh-CN': '好的，给您。', 'pt-BR': 'Certo, aqui está.', 'pt-PT': 'Certo, aqui está.', 'ko-KR': '네, 여기요.', 'ar-SA': 'حسناً، تفضل.', 'hi-IN': 'ठीक है, यह लीजिए।', 'nl-NL': 'Oké, alsjeblieft.', 'ru-RU': 'Хорошо, пожалуйста.', 'pl-PL': 'Dobrze, proszę.', 'tr-TR': 'Tamam, buyurun.', 'zh-TW': '好的，在這裡。' }, romanizationByLang: { 'ar-SA': 'Ḥasanan, tafaḍḍal.', 'ja-JP': 'Hai, dōzo.', 'zh-CN': 'Hǎo de, gěi nín.', 'zh-TW': 'Hǎo de, zài zhèlǐ.', 'ko-KR': 'Ne, yeogiyo.', 'hi-IN': 'Theek hai, yah lījiye.', 'ru-RU': 'Khorosho, pozhaluysta.' }, order: 5 },
    ],
  },
  l2: {
    id: 'conv-2',
    lessonId: 'l2',
    title: 'Airport Security Conversation',
    description: 'Practice going through airport security',
    scenario: 'Airport Security',
    turns: [
      { id: 't1', role: 'Officer', text: 'Now, put your bag on the security belt.', order: 0 },
      { id: 't2', role: 'Passenger', text: 'Do I need to remove my shoes?', order: 1 },
      { id: 't3', role: 'Officer', text: 'Yes, and also take out any electronics from your bag.', order: 2 },
      { id: 't4', role: 'Passenger', text: 'Alright, I will do that now.', order: 3 },
    ],
  },
  l3: {
    id: 'conv-3',
    lessonId: 'l3',
    title: 'Finding Your Seat',
    description: 'Practice finding your seat on the plane',
    scenario: 'Finding Your Seat',
    turns: [
      { id: 't1', role: 'Officer', text: 'Welcome aboard! Can I help you find your seat?', order: 0 },
      { id: 't2', role: 'Passenger', text: 'Yes, please. Where can I find seat 14A?', order: 1 },
      { id: 't3', role: 'Officer', text: 'It is near the window, on the left side of the plane.', order: 2 },
      { id: 't4', role: 'Passenger', text: 'Thank you very much!', order: 3 },
    ],
  },
  l4: {
    id: 'conv-4',
    lessonId: 'l4',
    title: 'Immigration and Customs',
    description: 'Practice going through immigration',
    scenario: 'Immigration',
    turns: [
      { id: 't1', role: 'Officer', text: 'What is the purpose of your visit?', order: 0 },
      { id: 't2', role: 'Passenger', text: 'I am visiting for a vacation.', order: 1 },
      { id: 't3', role: 'Officer', text: 'How long will you stay?', order: 2 },
      { id: 't4', role: 'Passenger', text: 'I will stay for five days.', order: 3 },
      { id: 't5', role: 'Officer', text: 'Please enjoy your trip and follow the airport signs for exit.', order: 4 },
      { id: 't6', role: 'Passenger', text: 'I will. Have a good day.', order: 5 },
    ],
  },
}

export async function getLessonConversationById(lessonId: string): Promise<LessonConversation | null> {
  try {
    const convRows = await db
      .select({
        id: lessonConversations.id,
        lessonId: lessonConversations.lessonId,
        title: lessonConversations.title,
        description: lessonConversations.description,
        scenario: lessonConversations.scenario,
      })
      .from(lessonConversations)
      .where(
        or(
          eq(lessonConversations.id, lessonId),
          eq(lessonConversations.lessonId, lessonId),
        ),
      )
      .limit(1)

    if (convRows.length > 0) {
      const conv = convRows[0]

      const turnsRows = await db
        .select({
          id: conversationTurns.id,
          role: conversationTurns.role,
          text: conversationTurns.text,
          textByLang: conversationTurns.textByLang,
          romanizationByLang: conversationTurns.romanizationByLang,
          order: conversationTurns.orderIndex,
        })
        .from(conversationTurns)
        .where(eq(conversationTurns.conversationId, conv.id))
        .orderBy(conversationTurns.orderIndex)

      const turns = turnsRows.map((t: any) => ({
        ...t,
        textByLang: typeof t.textByLang === 'string' ? JSON.parse(t.textByLang) : t.textByLang,
        romanizationByLang: typeof t.romanizationByLang === 'string' ? JSON.parse(t.romanizationByLang) : t.romanizationByLang,
      }))

      return {
        ...conv,
        turns,
      }
    }
  } catch (error) {
    console.error("Database Error (getLessonConversationById):", error)
  }

  return LESSON_CONVERSATIONS[lessonId] ?? null
}
