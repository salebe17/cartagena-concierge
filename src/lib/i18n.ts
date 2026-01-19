export type LanguageCode = 'es' | 'en' | 'pt' | 'fr' | 'zh' | 'it' | 'de';

export const translations: Record<LanguageCode, any> = {
    es: {
        title: "Solicitar Efectivo",
        subtitle: "Tu Concierge Privado en Cartagena",
        phone_label: "Número de Celular (WhatsApp)",
        location_label: "Detalles de Ubicación (Edificio/Apto)",
        amount_label: "Monto a Recibir (COP)",
        btn_submit: "Confirmar Pedido",
        alert_error: "⚠️ Faltan datos obligatorios"
    },
    en: {
        title: "Request Cash",
        subtitle: "Your Private Concierge in Cartagena",
        phone_label: "Phone Number (WhatsApp)",
        location_label: "Location Details (Building/Apt)",
        amount_label: "Amount to Receive (COP)",
        btn_submit: "Confirm Order",
        alert_error: "⚠️ Missing mandatory data"
    },
    pt: {
        title: "Solicitar Dinheiro",
        subtitle: "Seu Concierge Privado em Cartagena",
        phone_label: "Número de Celular (WhatsApp)",
        location_label: "Detalhes da Localização (Edifício/Apto)",
        amount_label: "Valor a Receber (COP)",
        btn_submit: "Confirmar Pedido",
        alert_error: "⚠️ Dados obrigatórios faltando"
    },
    fr: {
        title: "Demander du Cash",
        subtitle: "Votre Concierge Privé à Carthagène",
        phone_label: "Numéro de Portable (WhatsApp)",
        location_label: "Détails de l'emplacement (Bâtiment/Apt)",
        amount_label: "Montant à Recevoir (COP)",
        btn_submit: "Confirmer la Commande",
        alert_error: "⚠️ Données obligatoires manquantes"
    },
    zh: {
        title: "申请现金",
        subtitle: "您在卡塔赫纳的私人礼宾",
        phone_label: "手机号码 (WhatsApp)",
        location_label: "位置详情 (建筑物/公寓)",
        amount_label: "接收金额 (COP)",
        btn_submit: "确认订单",
        alert_error: "⚠️ 缺少必填数据"
    },
    it: {
        title: "Richiedi Contanti",
        subtitle: "Il tuo Concierge Privato a Cartagena",
        phone_label: "Numero di Cellulare (WhatsApp)",
        location_label: "Dettagli Posizione (Edificio/Appt)",
        amount_label: "Importo da Ricevere (COP)",
        btn_submit: "Conferma Ordine",
        alert_error: "⚠️ Dati obbligatori mancanti"
    },
    de: {
        title: "Bargeld Anfordern",
        subtitle: "Ihr Privater Concierge in Cartagena",
        phone_label: "Handynummer (WhatsApp)",
        location_label: "Standortdetails (Gebäude/Whg)",
        amount_label: "Betrag zu Erhalten (COP)",
        btn_submit: "Bestellung Bestätigen",
        alert_error: "⚠️ Fehlende Pflichtangaben"
    }
};
