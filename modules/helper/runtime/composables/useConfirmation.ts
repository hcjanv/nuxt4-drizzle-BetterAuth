import { LazyConfirmationModal } from '#components'
import type { ButtonProps, ModalProps } from '@nuxt/ui'

type Action = {
    onConfirm?: ButtonProps['onClick']
    onCancel?: ButtonProps['onClick']
    modal?: ModalProps
    cancel?: ButtonProps
    confirm?: ButtonProps
    color?: Color
    icon?: string
    title?: string
    description?: string
}

export function useConfirmation(props: Action) {
    const overlay = useOverlay()

    return overlay.create(LazyConfirmationModal, {
        props: {
            color: props.color || 'warning',
            title: props.title || '确定执行此操作？',
            description: props.description || '此操作不可撤销。',
            icon: props.icon || 'i-lucide-alert-triangle',
            modal: {
                title: '请确认',
                ...props.modal
            },
            cancel: {
                label: '取消',
                variant: 'outline',
                onClick: props.onCancel,
                ...props.cancel
            },
            confirm: {
                onClick: props.onConfirm,
                label: '确认',
                variant: 'solid',
                ...props.confirm
            }
        },
        defaultOpen: true
    })
}
