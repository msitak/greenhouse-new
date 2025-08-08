'use client'

import AgentBadge, { AGENT_NAME } from "@/components/ui/agentBadge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";
import OfferTile from "@/components/layout/offerTile";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";
import { testOffer } from "../api/test-offer";

export default function Home() {
  const [transactionType, setTransactionType] = useState('wynajem');

  const handleTypeChange = (newType: string) => {
    if (newType) { // Zabezpieczenie, aby zawsze była wybrana jakaś opcja
      setTransactionType(newType);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-4xl font-bold mb-4">Najnowsze oferty nieruchomości</h2>
        <div className="inline-flex gap-0 items-center rounded-xl justify-center bg-gray-100 p-0">
          <br />
          <ToggleGroup 
            type="single" 
            value={transactionType} 
            onValueChange={handleTypeChange}
            className="flex items-center" // Używamy flex i space-x do ułożenia przycisków
          >
            <ToggleGroupItem 
              value="sprzedaz"
              variant="pill" // Używamy naszego nowego wariantu
              className="px-8 py-2" // Dostosuj padding do swojego gustu
            >
              Sprzedaż
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="wynajem"
              variant="pill" // Używamy naszego nowego wariantu
              className="px-8 py-2" // Dostosuj padding do swojego gustu
            >
              Wynajem
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="grid grid-flow-col grid-rows-2 gap-4">
        <OfferTile />
      </div>

      <Carousel className="w-[424px]">
        <CarouselContent>
          <CarouselItem>
            <Image className="rounded-t-xl" src="/test-photo.jpg" alt="offer image" width={424} height={239} />
          </CarouselItem>
          <CarouselItem>
            <Image className="rounded-t-xl" src="/test-photo.jpg" alt="offer image" width={424} height={239} />
          </CarouselItem>
          <CarouselItem>
            <Image className="rounded-t-xl" src="/test-photo.jpg" alt="offer image" width={424} height={239} />
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="left-3" />
        <CarouselNext className="right-3" />
      </Carousel>
     </div>
  );
}
