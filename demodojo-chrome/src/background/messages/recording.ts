import type { PlasmoMessaging } from "@plasmohq/messaging"

interface RequestBody {
    type: "START_RECORDING" | "STOP_RECORDING" | "PAUSE_RECORDING" | "RESUME_RECORDING"
    data?: {
        sourceId: string
        audio: boolean
        tabId: number
    }
}

interface ResponseBody {
    success: boolean
    error?: string
    url?: string
    clickCount?: number
}

const handler: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> = async (req, res) => {
    // Your existing handler code here
    const { type, data } = req.body

    // ... rest of your handler logic
}

export default handler 