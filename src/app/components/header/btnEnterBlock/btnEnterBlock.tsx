'use client';
import React, {FC} from 'react';
import cls from './btnEnterBlock.module.scss'
import {Button} from "@/app/components/shared/ui/Button/Button";
import LogInSvg from "@/app/components/svgs/login.svg";
import ProfileSvg from "@/app/components/svgs/profile.svg";
import Profile from "@/app/components/header/profileList/profileList";
import {useAppDispatch, useAppSelector} from "@/app/redux/hooks/redux";
import {statePopupSliceActions} from "@/app/redux/entities/popups/stateLoginPopupSlice/stateLoginPopupSlice";
import Header from "@/app/components/header/header";

interface btnEnterBlockProps {
    classname?: string;
}

const BtnEnterBlock:FC<btnEnterBlockProps> = React.memo((props) => {
    const { classname } = props;
    const dispatch = useAppDispatch();

    //ACTIONS FROM REDUX
    // для изменения состояния попапа loginForm
    const { changeStateLoginFormPopup } = statePopupSliceActions;

    //STATES FROM REDUX
    //данные по авторизации
    const {stateAuth} = useAppSelector(state => state.auth)

    //USESTATE
    // для отображения и скрытия подменю профиля
    const[pointerOnProfile, setPointerOnProfile] = React.useState<boolean>(false)

    //USEREF

    //FUNCTIONS
    // для отображения и скрытия всплывающего меню на кнопке профиль
    // отслеживаем когда на кнопке
    const mouseOnProfile = React.useCallback(() => {
        setPointerOnProfile(true)
    },[]);
    // отслеживаем когда ушел курсор
    const mouseLeftProfile = React.useCallback(() => {
        setPointerOnProfile(false)
    },[]);
    // для открытия попапа
    const openLoginFormPopup = React.useCallback(() => {
        dispatch(changeStateLoginFormPopup(true));
    }, []);


    // слушатели событий
    // слушатели загрузки страницы
    // добавляем ширину, нужно чтобы понять отображать кнопку бургера или нет
    // window.addEventListener('load', () => {
    //     dispatch(setWindowWidth(document.documentElement.clientWidth));
    // })
    // // при мзменении ширины экрана фикрисуем ее
    // window.addEventListener('resize', () => {
    //     dispatch(setWindowWidth(window.innerWidth));
    // })
    // // контроль скролла для скрытия header
    // window.addEventListener('scroll', (e) => {
    //     dispatch(setScrolledHeight(window.scrollY));
    // });
    // // запрещаем скролить когда открыто бургер меню
    // window.addEventListener('wheel', (e) => {
    //     if (burgerMenuOpenRef.current) return;
    //     if (e.deltaY > 0 && scrolledHeight >= 85) {
    //         dispatch(setScrollDown(true));
    //         dispatch(setScrollUp(false));
    //     }
    //     if (e.deltaY < 0) {
    //         dispatch(setScrollDown(false));
    //         dispatch(setScrollUp(true));
    //     }
    // });

    return (
        <div
            className={cls.coverProfile}
            onPointerLeave={stateAuth ? mouseLeftProfile : undefined}
        >
            <Button
                classname={cls.buttonLogin}
                onClick ={!stateAuth ? openLoginFormPopup : undefined}
                onPointerEnter={stateAuth ? mouseOnProfile : undefined}
                type='button'
                name='login'
            >
                {!stateAuth
                    ? <LogInSvg  className={cls.svgProfile}/>
                    : <ProfileSvg className={cls.svgProfile}/>
                }
                {!stateAuth ? 'Войти' : 'Профиль'}
            </Button>
            {pointerOnProfile && stateAuth &&
                <Profile
                    classname={cls.profileBlock}
                />
            }
        </div>
    );
});

export default BtnEnterBlock;