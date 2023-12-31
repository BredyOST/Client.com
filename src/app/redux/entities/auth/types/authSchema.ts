export interface PurchasedCategory {
    id: number // id купленной категории
    name: string // Имя купленной категории
    purchaseBuyDate: Date // Дата покупки
    purchaseEndDate: Date // Дата окончания подписки
    purchasePeriod: number
}



export type User = {
    email: string
    forChangeEmail: string
    phoneNumber: string
    forChangePhoneNumber: string
    fullName: string
    isAdmin: boolean
    isMainAdmin: boolean
    isActivatedEmail: boolean
    isActivatedPhone: boolean
    activatedFreePeriod: boolean
    endFreePeriod: boolean
    activatedFreePeriodNotification: boolean
    endFreePeriodNotification: boolean
    ip: string
    categoriesFreePeriod: PurchasedCategory[]
    notificationsFreePeriod: PurchasedCategory[]
    categoriesHasBought: PurchasedCategory[]
    timeCallVerify: Date
    timeSendMessageVerify: Date
    createdAt: Date
    updateAt: Date
    deletedAt: Date
}



export interface AuthSchema {
    data: User | null,
    isAdmin:boolean,
    isMainAdmin:boolean,
    stateAuth: boolean,
}