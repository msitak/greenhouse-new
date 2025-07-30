import React from "react";
import Image from "next/image";
import { Separator } from "../ui/separator";
import AgentBadge, { AGENT_NAME } from "../ui/agentBadge";



const OfferTile = () => {
    return (
        <div className="relative rounded-xl w-fit shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]">
            <Image className="rounded-t-xl" src="/test-photo.jpg" alt="offer image" width={424} height={239} />
            <AgentBadge className="absolute top-3 left-3" agentName={AGENT_NAME.PATRYK} />
            <div className="p-4">
                <p className="font-medium text-base mb-4">Jana III Sobieskiego, Częstochowa</p>
                <div className="flex gap-4 mb-4">
                    <span>2 pokoje</span>
                    <span>47 m2</span>
                    <span>1 piętro</span>
                </div>
                <Separator color="#F4F4F4" className="h-6" />
                <h2 className="font-black text-2xl my-4 text-green-primary">4000 zł</h2>
            </div>
        </div>
    )
}

export default OfferTile;