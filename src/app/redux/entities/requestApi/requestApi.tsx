import {destroyCookie, parseCookies, setCookie} from 'nookies'
import {BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError} from "@reduxjs/toolkit/query/react";
import {authSliceActions} from "@/app/redux/entities/auth/slice/authSlice";
import {indicatorsNotifications} from "@/app/redux/entities/notifications/notificationsSlice";


const {addInfoForCommonRequest, addInfoForCommonError} = indicatorsNotifications;


const baseQueryWithAuth = fetchBaseQuery({
    baseUrl: 'http://localhost:7777',
    prepareHeaders: async (headers:any) => {
        const cookies = parseCookies()

        if (cookies) headers.set('authorization', `Bearer ${cookies._z}`);

        const sessionToken = cookies._a;
        if (sessionToken) headers.set('session-token', cookies._a);

        headers.set('Accept', 'application/json')
        headers.set('Cache-Control', 'no-cache')
        headers.set('Pragma', 'no-cache')
        headers.set('Expires', '0')
        return headers;
    }
})

const {LogOutFromProfile, addRole, addAuthStatus} =  authSliceActions;

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
) => {
    let result = await baseQueryWithAuth(args, api, extraOptions)
    // если приходит ответ, что истекла сессия, значит кто-то вошел в браузер или токен сессии истек и все очищаем (куки, хранилище и уведомляем об этом)
    if (result && result.data && 'text' in result.data && result.data.text=== 'Ваша сессия истекла, выполните повторный вход') {
        api.dispatch(addInfoForCommonRequest(result.data))
        destroyCookie(null, "_z", {path:'/'});
        destroyCookie(null, "_d", {path:'/'});
        destroyCookie(null, "_a", {path:'/'});
        api.dispatch(LogOutFromProfile(null));
        api.dispatch(addRole(' '));
        api.dispatch(addAuthStatus(false));
        location.reload()
    }
    //если при запросе приходит Unauthorized значит токен доступа не действителей и надо его обновить
    if (result.error && result.error.data && result.error.data.message === 'Unauthorized') {
        // проверяем куки
        const cookies = parseCookies()
        // делаем запрос на получение новых токенов (доступа и сессии) и передаем рефреш токен для этого
        const refreshResult = await baseQueryWithAuth(
            { url: `/auth/login/access-token`, method: 'POST', body:{refreshToken:cookies._d} },
            api,
            extraOptions
        )
        // и записываем в куки новые токены если пришли новые
        if (refreshResult && refreshResult.data && refreshResult.data.refreshToken && refreshResult.data.accessToken) {
            const refeshTokenResult = refreshResult as any

            setCookie(null, '_d', refeshTokenResult.data.refreshToken, {
                path:'/'
            })
            setCookie(null, '_z', refeshTokenResult.data.accessToken, {
                path:'/'
            })
            setCookie(null, '_a', refeshTokenResult.data.sessionToken, {
                path:'/'
            })
            // повторяем ранее навправленный запрос
            result = await baseQueryWithAuth(args, api, extraOptions)
        } else {
            //если токена нет, не валидный то очищаем кукм
            destroyCookie(null, "_z", {path:'/'});
            destroyCookie(null, "_d", {path:'/'});
            destroyCookie(null, "_a", {path:'/'});
            api.dispatch(LogOutFromProfile(null));
            api.dispatch(addRole(' '));
            api.dispatch(addAuthStatus(false));
            location.reload()

        }
    }
    // если есть ошибка то прокидываем его для уведомления
    if (result && result.error && result.error.data && 'message' in result.error.data &&  result.error.data.message !== 'Unauthorized') {
        api.dispatch(addInfoForCommonError(result.error.data))
    }
    // если есть сообщение то прокидываем его для уведомления
    if (result && result.data && 'text' in result.data && result.data.text ) {
        api.dispatch(addInfoForCommonRequest(result.data))
    }

    return result
}

export const requestApi = createApi({
    reducerPath: 'requestApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['request'],
    endpoints: (builder) => ({
        getTutorPostz: builder.query<any, any>({
            query: ((option) => ({
                url: `${option
                    ? 'films'
                    : 'films'
                }`,
                params: {
                    _limit: option.limit,
                    _page: option.page,
                },
                method: 'GET',
            })),
            providesTags: (result) => ['request'],
        }),
        // методы регистрации и входа
        registerUser: builder.mutation<any, any>({
            query: (params) => ({
                url: '/auth/register',
                method: 'POST',
                body: params,
            }),
        }),
        loginIn: builder.mutation<any, any>({
            query: (params) => ({
                url: '/auth/login',
                method: 'POST',
                body: params,
            }),
        }),
        repeatActivation:builder.mutation({
            query:(params) => ({
                url: '/auth/activateRepeat',
                method:'POST',
                body:params,
            }),
        }),
        changePassword:builder.mutation({
            query:(params) => ({
                url: '/auth/forgetPassword',
                method:'POST',
                body:params,
            }),
        }),
        getNewToken: builder.mutation<any, any>({
            query: (params) => ({
                url: `/auth/login/access-token`,
                method: 'POST',
                body: params,
            }),
        }),

        //получить пользователя
        getMe:builder.mutation({
            query:(token) => ({
                url: '/users/profile',
	        	method:'GET'
            }),
        }),
        changeNameAndCard: builder.mutation<any, any>({
            query: (params) => ({
                url: '/users/update/fullName',
                method: 'PATCH',
                body: params,
            }),
        }),
        codeForEmail: builder.mutation<any, any>({
            query: (params) => ({
                url: '/users/update/codeEmail',
                method: 'POST',
                body: params,
            }),
        }),
        changeEmail: builder.mutation<any, any>({
            query: (params) => ({
                url: '/users/update/email',
                method: 'PATCH',
                body: params,
            }),
        }),
        changePhone: builder.mutation<any, any>({
            query: (params) => ({
                url: '/users/update/phone',
                method: 'PATCH',
                body: params,
            }),
        }),
        changePasswordInProfile: builder.mutation<any, any>({
            query: (params) => ({
                url: '/users/update/password',
                method: 'PATCH',
                body: params,
            }),
        }),
        call: builder.mutation<any, any>({
            query: (params) => ({
                url: `/users/call`,
                method: 'POST',
                body: params,
            }),
        }),
        callCode: builder.mutation<any, any>({
            query: (params) => ({
                url: `/users/call/code`,
                method: 'POST',
                body: params,
            }),
        }),

        createCategory: builder.mutation<any, any>({
            query: (params) => ({
                url: '/categories/create',
                method: 'POST',
                body: params,
            }),
        }),
        updateCategory: builder.mutation<any, any>({
            query: (params) => ({
                url: '/categories/update',
                method: 'PATCH',
                body: params,
            }),
        }),
        deleteCategory: builder.mutation<any, any>({
            query: (params) => ({
                url: '/categories/delete',
                method: 'DELETE',
                body: params,
            }),
        }),
        getCategories: builder.mutation<any, any>({
            query: () => ({
                url: '/categories/getAll',
                method: 'GET',
            }),
        }),
        getCategory: builder.mutation<any, any>({
            query: (token) => ({
                url: '/categories/getOne',
                method: 'GET',
            }),
        }),
        getFreePeriod: builder.mutation<any, any>({
            query: (params) => ({
                url: '/categories/freePeriod',
                method: 'POST',
                body: params,
            }),
        }),



        addGroup: builder.mutation<any, any>({
            query: (params) => ({
                url: `/groups-from-vk/create`,
                method: 'POST',
                body: params,
            }),
        }),
        getGroups: builder.mutation<any, any>({
            query: (token) => ({
                url: `/groups-from-vk/getAll`,
                method: 'GET',
            }),
        }),
        updateGroup: builder.mutation<any, any>({
            query: (params) => ({
                url: `/groups-from-vk/update`,
                method: 'PATCH',
                body: params,
            }),
        }),
        deleteGroup: builder.mutation<any, any>({
            query: (params) => ({
                url: `/chats-from-telegram/delete`,
                method: 'DELETE',
                body: params,
            }),
        }),


        addChat: builder.mutation<any, any>({
            query: (params) => ({
                url: `/chats-from-telegram/create`,
                method: 'POST',
                body: params,
            }),
        }),
        getChat: builder.mutation<any, any>({
            query: (token) => ({
                url: `/chats-from-telegram/getAll`,
                method: 'GET',
            }),
        }),
        updateChat: builder.mutation<any, any>({
            query: (params) => ({
                url: `/chats-from-telegram/update`,
                method: 'PATCH',
                body: params,
            }),
        }),
        deleteChat: builder.mutation<any, any>({
            query: (params) => ({
                url: `/chats-from-telegram/delete`,
                method: 'DELETE',
                body: params,
            }),
        }),


        createAndCheckAllPosts: builder.mutation<any, any>({
            query: (token) => ({
                url: `/posts/createAndCheck`,
                method: 'GET',
            }),
        }),
        getAllPosts: builder.mutation<any, any>({
            query: (token) => ({
                url: `/posts/getAll`,
                method: 'GET',
            }),
        }),
        startAddTutorsPosts: builder.mutation<any, any>({
            query: (token) => ({
                url: `/posts/addPostsToTutors`,
                method: 'GET',
            }),
        }),
        deleteAllPostsFromMainRepository: builder.mutation<any, any>({
            query: (token) => ({
                url: `/posts/deleteAll`,
                method: 'DELETE',
            }),
        }),
        deleteGroupInMainRepository: builder.mutation<any, any>({
            query: (params) => ({
                url: `/posts/deleteGroup`,
                method: 'DELETE',
                body: params,
            }),
        }),

        getTutorsPosts:builder.mutation({
            query:(token) => ({
                url: '/tutors/all',
                method:'GET',
            }),
        }),

        getNanniesPosts:builder.mutation({
            query:(token) => ({
                url: '/nannies/all',
                method:'GET',
            }),
        }),

        addNewFile:builder.mutation({
            query:(params) => ({
                url: '/files',
                method:'POST',
                body: params,
                headers: {
                    'Custom-Header': 'multipart/form-data',
                },
            }),
        }),
        getFiles:builder.mutation({
            query:(token) => ({
                url: '/files/getAll',
                method:'GET',
            }),
        }),
        deleteFile: builder.mutation<any, any>({
            query: (params) => ({
                url: '/files/delete',
                method: 'DELETE',
                body: params,
            }),
        }),

        getLogs:builder.mutation({
            query:(token) => ({
                url: '/logs/info',
                method:'GET',
            }),
        }),

        // получить авторизацию
        getAuthorizations:builder.mutation({
            query:(token) => ({
                url: '/authorizations/getMyAuthorizations',
                method:'GET',
            }),
        }),

        //прайс
        addNewPriceBlock:builder.mutation({
            query:(params) => ({
                url: '/prices/create',
                method:'POST',
                body: params,
            }),
        }),
        getAllPrices:builder.mutation({
            query:() => ({
                url: '/prices/getAll',
                method:'GET',
            }),
        }),


        //TEST
        getALLTest:builder.mutation({
            query:(params) => ({
                url: '/posts/testAllPosts',
                method:'POST',
                body: params,
            }),
        }),

        getSortedPostsFromSearchPage:builder.mutation({
            query:(params) => ({
                url: '/getPostsFromAll/all',
                method:'POST',
                body: params,
            }),
        }),


        activateFreeNotification: builder.mutation<any, any>({
            query: (params) => ({
                url: '/notifications/create',
                method: 'POST',
                body: params,
            }),
        }),


    }),
});

export const {
    useLoginInMutation,
    useRegisterUserMutation,
    useGetMeMutation,
    useRepeatActivationMutation,
    useChangePasswordMutation,
    useGetTutorsPostsMutation,
    useChangeNameAndCardMutation,
    useCodeForEmailMutation,
    useChangeEmailMutation,
    useCallMutation,
    useChangePhoneMutation,
    useChangePasswordInProfileMutation,
    useCreateCategoryMutation,
    useGetCategoriesMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
    useCallCodeMutation,
    useAddGroupMutation,
    useGetGroupsMutation,
    useDeleteGroupMutation,
    useUpdateGroupMutation,
    useCreateAndCheckAllPostsMutation,
    useGetAllPostsMutation,
    useStartAddTutorsPostsMutation,
    useDeleteAllPostsFromMainRepositoryMutation,
    useAddNewFileMutation,
    useGetFilesMutation,
    useDeleteFileMutation,
    useGetCategoryMutation,
    useDeleteGroupInMainRepositoryMutation,
    useGetLogsMutation,
    useGetAuthorizationsMutation,
    useAddNewPriceBlockMutation,
    useGetAllPricesMutation,
    useGetFreePeriodMutation,
    useGetALLTestMutation,
    useAddChatMutation,
    useDeleteChatMutation,
    useGetChatMutation,
    useUpdateChatMutation,
    useGetSortedPostsFromSearchPageMutation,
    useActivateFreeNotificationMutation,
    useGetNanniesPostsMutation
} = requestApi;