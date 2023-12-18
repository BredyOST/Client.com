'use client';
import React, {ChangeEvent, FC} from 'react';
import cls from './inputCategory.module.scss'
import {Input} from "@/app/components/shared/ui/input/Input";
import {Button} from "@/app/components/shared/ui/Button/Button";
import {classNames} from "@/app/components/shared/lib/classNames/className";
import {useDeleteCategoryMutation, useUpdateCategoryMutation} from "@/app/redux/entities/requestApi/requestApi";

interface inputCategoryProps {
    classname?: string;
    value?:string;
    index?: string
    item?:any
}

const InputCategory:FC<inputCategoryProps> = (props) => {
    const {
        classname,
        value,
        index,
        item
    } = props;

    //RTK
    const [ updateCategory, {data: requestupdateCategory, error:errorupdateCategory, isLoading: isLoadingupdateCategory, isError:isErrorupdateCategory}] = useUpdateCategoryMutation()
    const [deleteCategory, {data: requesteleteCategoryCategory, error:erroreleteCategoryCategory, isLoading: isLoadingeleteCategoryCategory, isError:isErroreleteCategoryCategory}] = useDeleteCategoryMutation()


    //ACTIONS FROM REDUX

    //STATES FROM REDUX

    //USESTATE
    const [idCategory, setIdCategory] = React.useState<string>(item.id_category ? item.id_category : '')
    const [nameCategory, setNameIdCategory] = React.useState<string>(item.name ? item.name : '')
    const [descriptionCategory, setDescriptionIdCategory] = React.useState<string>(item.description ? item.description : '')

    //USEREF

    //FUNCTIONS

    const changeId = (e:ChangeEvent<HTMLInputElement>) => {
        setIdCategory(e.target.value)
    }
    const changeName = (e:ChangeEvent<HTMLInputElement>) => {
        setNameIdCategory(e.target.value)
    }
    const changeDescription = (e:ChangeEvent<HTMLInputElement>) => {
        setDescriptionIdCategory(e.target.value)
    }

    const updateThisCategory = (id:number) => {
        updateCategory({
            id:item.id,
            id_category: idCategory ? idCategory : item.id_category,
            name: nameCategory ? nameCategory : item.name,
            description: descriptionCategory ? descriptionCategory : item.description,
        })
    }
    const deleteThisCategory = (id:number) => {
        deleteCategory({
            id:item.id
        })
    }

    React.useEffect(
        () => {
            console.log(idCategory)
        }, []
    )

    return (
        <div className={classNames(cls.inputCategory, {},[classname] )} >
            <div>{index + 1}</div>
            <input
                value={idCategory ? idCategory : ''}
                onChange={(e) => changeId(e)}
                className={cls.inputNoPadding}
            />
            <input
                value={nameCategory ? nameCategory : ''}
                className={cls.inputNoPadding}
                onChange={(e) => changeName(e)}
            />
            <input
                value={descriptionCategory ? descriptionCategory : ''}
                className={cls.inputNoPadding}
                onChange={(e) => changeDescription(e)}
            />
            <div>{new Date(item.createdAt).toDateString()}</div>
            <div>{new Date(item.updateAt).toDateString()}</div>
                <Button
                    classname={cls.btn}
                    onClick = {updateThisCategory}
                >
                    сохранить
                </Button>
                <Button
                    onClick={deleteThisCategory}
                    classname={cls.btn}
                >
                    удалить
                </Button>
        </div>
    );
};

export default InputCategory;