'use client';
import React, {ChangeEvent, FC} from 'react';
import cls from './registration.module.scss'
import {Input} from "@/app/components/shared/ui/input/Input";
import {Button} from "@/app/components/shared/ui/Button/Button";
import ShowSvg from "@/app/components/svgs/show.svg";
import HideSvg from "@/app/components/svgs/hide.svg";
import {SubmitHandler, useForm} from "react-hook-form";
import {useAppDispatch, useAppSelector} from "@/app/redux/hooks/redux";
import {useRegisterUserMutation} from "@/app/redux/entities/requestApi/requestApi";
import {stateAuthWindowSliceActions} from "@/app/redux/entities/stateAuthWindowSlice/stateAuthWindowSlice";
import Loader from "@/app/components/shared/ui/Loader/Loader";
import {statePopupSliceActions} from "@/app/redux/entities/popups/stateLoginPopupSlice/stateLoginPopupSlice";
import {indicatorsNotifications} from "@/app/redux/entities/notifications/notificationsSlice";

interface RegistrationProps {
    classname?: string;
}

type loginForm = {
    mailOrNumberRegistration: string,
    passwordRegistration: string,
    passwordRegistrationCheck:string,
}

interface ForTextForms {
    loginRegister: string,
    passwordRegister: string,
    passwordRegisterCheck:string
}

interface passwordHide {
    register: boolean,
    registerCheck:boolean,
    registerShowHide: boolean,
    registerCheckShowHide:boolean
}

type createUserType = {
    email: string
    password: string
    passwordCheck: string
}

const Registration:FC<RegistrationProps> = (props) => {
    const {
        classname,
    } = props;
    const dispatch = useAppDispatch();
    //RTK
    // Запрос на регистрацию пользователя
    let [registerIn, {
        data: requestRegister, error: errorRegister, isError: isErrorRegister,  isLoading: loadingRegister,
    }] = useRegisterUserMutation();

    //ACTIONS FROM REDUX
    // для изменения текущего состояния попапа (от 1 до 3)
    const { changeStateClickOnEnter } = stateAuthWindowSliceActions;
    const { closeAllPopups } = statePopupSliceActions;
    const {addInfoForCommonRequest, addInfoForCommonError} = indicatorsNotifications;

    //STATES FROM REDUX
    // для определения текущего состояния попапа, окно входа, ргистрация, забыл пароль. при первом открытии открывается окно входа
    const { clickOnEnter } = useAppSelector((state) => state.statePopup);

    //USESTATE
    // для отображения введенных символов в инпуте пароля, login и registration, registerCheck - false значит ничего в поля не введено, loginShowHide, registerShowHide: false - значит пароль скрыт
    const [passwordHideButton, setPasswordHideButton] = React.useState<passwordHide>({
        register: false, registerCheck:false, registerShowHide: false, registerCheckShowHide: false,
    });
    // для того чтобы делать проверки после введенного логина в графы. Делаем управляемые импуты
    const [textFromForms, setTextFromForms] = React.useState<ForTextForms>({
        loginRegister:'', passwordRegister: '', passwordRegisterCheck: '',
    });
    //проверка соответствия паролей в инпутах
    const [comparePassword, serComparePassword] = React.useState<boolean | ' '>(' ');
    //USEREF
    // для получения элемента input при входе (ввод логина)
    const loginRegisterRef = React.useRef<HTMLInputElement | null>(null);
    // для получения элемента input при регистрации (ввод пароля)
    const passwordRegisterRef = React.useRef<HTMLInputElement | null>(null);
    // для получения элемента input при регистрации (ввод пароля)
    const passwordRegisterCheckRef = React.useRef<HTMLInputElement | null>(null);
    //FUNCTIONS
    const onSubmit: SubmitHandler<loginForm> = (data) => {
        const textError = {
            message: 'Не совпадают введенные пароли'
        }
        if(!comparePassword) dispatch(addInfoForCommonError(textError))
        // отправляем данные на регистрацию пользователя и создаем объект для передачи
        if(comparePassword) {
            const infoForRegistration:createUserType = {
                email:data.mailOrNumberRegistration,
                password:data.passwordRegistration,
                passwordCheck:data.passwordRegistrationCheck,
            }
            registerIn(infoForRegistration).then((results) => {
                if(results) {
                    console.log(results)
                    dispatch(closeAllPopups(true))
                }
            })
        }
    };

    //  для отправки запроса с form и регистрации полей инпута, для валидации регистрации. когда поля пустые выдает предупреждение
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isValid },
    } = useForm<loginForm>({
        mode: 'onChange',
    });

    // для изменения индикатора который меняет type у input на text или password. Показать или скрыть пароль при вводе
    const showAndHideTextPassword = (name:any) => {
        setPasswordHideButton({ ...passwordHideButton, registerShowHide: !passwordHideButton.registerShowHide });
    };
    const showAndHideTextTwoPassword = (name:any) => {
        setPasswordHideButton({ ...passwordHideButton, registerCheckShowHide: !passwordHideButton.registerCheckShowHide });
    };

    // при регистрации
    const checkTextFormsRegistration = (e: any) => {

        if (clickOnEnter === 1) {
            const targetName = e.target.name;
            const value = e.target.value;

            if (targetName === 'passwordRegistration' || targetName === 'passwordRegistrationCheck') {
                const isPassword = targetName === 'passwordRegistration';
                const isPasswordCheck = targetName === 'passwordRegistrationCheck';
                if (isPassword) {
                    setTextFromForms({ ...textFromForms, passwordRegister: value });
                    value.length
                        ?  setPasswordHideButton({ ...passwordHideButton, register: true })
                        :  setPasswordHideButton({ ...passwordHideButton, register: false });
                }

                if(isPasswordCheck) {
                    setTextFromForms({ ...textFromForms, passwordRegisterCheck: value });
                    value.length
                        ? setPasswordHideButton({ ...passwordHideButton, registerCheck: true })
                        : setPasswordHideButton({ ...passwordHideButton, registerCheck: false });
                }
            }
        }
    };

    // провека введенных паролей в инпуты на соответствие
    React.useEffect(() => {
        if(textFromForms.passwordRegister !== textFromForms.passwordRegisterCheck) {
            serComparePassword(false)
        }
        if(textFromForms.passwordRegister === textFromForms.passwordRegisterCheck) {
            serComparePassword(true)
        }
    },[textFromForms.passwordRegister, textFromForms.passwordRegisterCheck])

    // возвращаемся на ввод логина и пароля
    const backToLoginIn = () => {
        dispatch(changeStateClickOnEnter(0));
    };

    if (clickOnEnter != 1 ) {
        return null
    }

    return (
        <form
            className={cls.form}
            onSubmit={handleSubmit(onSubmit)}
            onChange={checkTextFormsRegistration}
        >
            <h2
                className={cls.title}
            >
                Регистрация учетной записи
            </h2>
            <div className={cls.inputsForm}>
                <Input
                    type="text"
                    classForInput={cls.input}
                    classname={cls.inputRelative}
                    placeholder="Введите email"
                    autofocus
                    defaultValue={textFromForms.loginRegister}
                    disabled={loadingRegister && true}
                    forRef={loginRegisterRef}
                    register={{
                        ...register('mailOrNumberRegistration', {
                            required: 'Пожалуйста введите корректный email или номер телефона',
                            pattern: {
                                // eslint-disable-next-line max-len
                                value: /^(?:[a-zA-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/,
                                message: 'Введите корректный email',
                            },
                            minLength: {
                                value: 0,
                                message: '',
                            },
                            maxLength: {
                                value: 255,
                                message: '',
                            },
                        }),
                    }
                    }
                >
                    <div className={cls.error}>
                        {errors.mailOrNumberRegistration && errors.mailOrNumberRegistration.type === 'minLength' && <div>{errors.mailOrNumberRegistration.message}</div>}
                        {errors.mailOrNumberRegistration && errors.mailOrNumberRegistration.type === 'pattern' && <div>{errors.mailOrNumberRegistration.message}</div>}
                    </div>
                </Input>
                <div className={cls.coverPassword}>
                    <Input
                        classForInput={cls.input}
                        type={passwordHideButton.registerShowHide ? 'text' : 'password'}
                        placeholder="Введите пароль"
                        classname={cls.inputRelative}
                        defaultValue={textFromForms.passwordRegister}
                        disabled={loadingRegister && true}
                        forRef={passwordRegisterRef}
                        register={{
                            ...register('passwordRegistration', {
                                required: 'Пароль должен содержать от 5 до 20 символов',
                                minLength: {
                                    value: 5,
                                    message: 'Пароль должен содержать не менее 5 символов',
                                },
                                maxLength: {
                                    value: 20,
                                    message: 'Пароль должен содержать не более 20 символов',
                                },
                            }),
                        }}
                    >
                        {
                            passwordHideButton.register
                            && (
                                <Button
                                    type="button"
                                    classname={cls.hideButton}
                                    name='textRegistrationPasswordMain'
                                    addNametoFunction={true}
                                    onClick={showAndHideTextPassword}
                                >
                                    {!passwordHideButton.registerShowHide ? <ShowSvg className={cls.showSvg} /> : <HideSvg className={cls.hideSvg} />}
                                </Button>
                            )
                        }
                        <div className={cls.error}>
                            {errors.passwordRegistration && errors.passwordRegistration.type === 'minLength' && <div>{errors.passwordRegistration.message}</div>}
                        </div>
                    </Input>
                    <Input
                        classForInput={cls.input}
                        type={passwordHideButton.registerCheckShowHide ? 'text' : 'password'}
                        placeholder="Повторите пароль"
                        classname={cls.inputRelative}
                        defaultValue={textFromForms.passwordRegisterCheck}
                        disabled={loadingRegister && true}
                        forRef={passwordRegisterCheckRef}
                        register={{
                            ...register('passwordRegistrationCheck'),
                        }}
                    >
                        {
                            passwordHideButton.registerCheck
                            && (
                                <Button
                                    type="button"
                                    name='textRegistrationPassword'
                                    addNametoFunction={true}
                                    classname={cls.hideButton}
                                    onClick={showAndHideTextTwoPassword}
                                >
                                    {!passwordHideButton.registerCheckShowHide ? <ShowSvg className={cls.showSvg} /> : <HideSvg className={cls.hideSvg} />}
                                </Button>
                            )
                        }
                        <div className={cls.error}>
                            {comparePassword === false && <div>Пароли не совпадают</div>}
                        </div>
                    </Input>
                </div>
            </div>
            <div className={cls.btnCoverTwo}>
                <Button
                    classname={cls.btnEnter}
                    type="submit"
                >
                    Зарегистрироваться
                </Button>
                <Button
                    classname={cls.btnEnter}
                    onClick={backToLoginIn}
                    type="button"
                >
                    Вернуться
                </Button>
            </div>
            {loadingRegister
                && (
                    <Loader
                        classname="color-dark"
                    />
                )}
        </form>
    )
};

export default Registration;