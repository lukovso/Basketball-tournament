let fs = require('fs');


let podaciGrupa = JSON.parse(fs.readFileSync('groups.json', 'utf-8'));
let rezultatiPrijateljskih = JSON.parse(fs.readFileSync('exibitions.json', 'utf-8'));


function izracunajRazlikuRezultata(rezultat) {
    let [rezultatTima1, rezultatTima2] = rezultat.split('-').map(Number);
    return rezultatTima1 - rezultatTima2;
}


function izracunajFormuTima(ISOKodTima) {
    let utakmice = rezultatiPrijateljskih[ISOKodTima] || [];
    let forma = 0;
    utakmice.forEach(utakmica => {
        forma += izracunajRazlikuRezultata(utakmica.Result);
    });
    return forma;
}


function izracunajRezultatUtakmice(tim1, tim2) {
    let razlikaRangiranja = tim2.FIBARanking - tim1.FIBARanking; 
    let formaTima1 = izracunajFormuTima(tim1.ISOCode);
    let formaTima2 = izracunajFormuTima(tim2.ISOCode);

    let rezultatTima1 = Math.floor(Math.random() * 20 + 80 + razlikaRangiranja + formaTima1 / 10);
    let rezultatTima2 = Math.floor(Math.random() * 20 + 80 - razlikaRangiranja + formaTima2 / 10);

    return [rezultatTima1, rezultatTima2];
}


function odigrajGrupnuFazu(grupe) {
    let rezultatiGrupa = {};

    console.log('Grupna faza:');

    for (let grupa in grupe) {
        let timovi = grupe[grupa];
        rezultatiGrupa[grupa] = [];

        
        for (let i = 0; i < timovi.length; i++) {
            for (let j = i + 1; j < timovi.length; j++) {
                let tim1 = timovi[i];
                let tim2 = timovi[j];
                let [rezultatTima1, rezultatTima2] = izracunajRezultatUtakmice(tim1, tim2);

                console.log(`${tim1.Team} - ${tim2.Team} (${rezultatTima1}:${rezultatTima2})`);

                rezultatiGrupa[grupa].push({
                    tim1: tim1.ISOCode,
                    tim2: tim2.ISOCode,
                    rezultatTima1,
                    rezultatTima2,
                });
            }
        }
    }

    return rezultatiGrupa;
}


function rangirajTimove(grupe, rezultatiGrupa) {
    let rangiranje = {};

    for (let grupa in grupe) {
        let timovi = grupe[grupa].map(tim => ({ ...tim, bodovi: 0, postignutiKosevi: 0, primljeniKosevi: 0 }));

        rezultatiGrupa[grupa].forEach(rezultat => {
            let tim1 = timovi.find(t => t.ISOCode === rezultat.tim1);
            let tim2 = timovi.find(t => t.ISOCode === rezultat.tim2);

            tim1.postignutiKosevi += rezultat.rezultatTima1;
            tim1.primljeniKosevi += rezultat.rezultatTima2;
            tim2.postignutiKosevi += rezultat.rezultatTima2;
            tim2.primljeniKosevi += rezultat.rezultatTima1;

            
            if (rezultat.rezultatTima1 > rezultat.rezultatTima2) {
                tim1.bodovi += 2;
                tim2.bodovi += 1;
            } else {
                tim1.bodovi += 1;
                tim2.bodovi += 2;
            }
        });

        
        timovi.sort((a, b) => b.bodovi - a.bodovi || (b.postignutiKosevi - b.primljeniKosevi) - (a.postignutiKosevi - a.primljeniKosevi) || b.postignutiKosevi - a.postignutiKosevi);
        rangiranje[grupa] = timovi;
    }

    return rangiranje;
}


function kreirajCetvrtfinale(rangiranje) {
    let sviTimovi = Object.values(rangiranje).flat();
    let rangiraniTimovi = sviTimovi.sort((a, b) => b.bodovi - a.bodovi || (b.postignutiKosevi - b.primljeniKosevi) - (a.postignutiKosevi - a.primljeniKosevi) || b.postignutiKosevi - a.postignutiKosevi);

    let cetvrtfinale = [
        [rangiraniTimovi[0], rangiraniTimovi[7]],
        [rangiraniTimovi[1], rangiraniTimovi[6]],
        [rangiraniTimovi[2], rangiraniTimovi[5]],
        [rangiraniTimovi[3], rangiraniTimovi[4]],
    ];

    return cetvrtfinale;
}


function odigrajEliminacioneRunde(parovi) {
    return parovi.map(([tim1, tim2]) => {
        let [rezultatTima1, rezultatTima2] = izracunajRezultatUtakmice(tim1, tim2);
        console.log(`${tim1.Team} - ${tim2.Team} (${rezultatTima1}:${rezultatTima2})`);
        return rezultatTima1 > rezultatTima2 ? tim1 : tim2;
    });

}
    function porazeniPolufinalista(polufinalisti, finalisti){
        let porazeni = polufinalisti.filter(tim => !finalisti.includes(tim))
        return porazeni
    }
function odigrajTreceMesto(tim1, tim2) {
        let [rezultatTima1, rezultatTima2] = izracunajRezultatUtakmice(tim1, tim2);
        console.log(`${tim1.Team} - ${tim2.Team} (${rezultatTima1}:${rezultatTima2})`);
        return rezultatTima1 > rezultatTima2 ? tim1 : tim2;
    };



function odigrajTurnir() {
    let rezultatiGrupa = odigrajGrupnuFazu(podaciGrupa);
    let rangiranje = rangirajTimove(podaciGrupa, rezultatiGrupa);

    console.log('\nRangiranje po grupama:');
    for (let grupa in rangiranje) {
        console.log(`Grupa ${grupa}:`);
        rangiranje[grupa].forEach(tim => {
            console.log(`${tim.Team} - Bodovi: ${tim.bodovi}, Postignuti koševi: ${tim.postignutiKosevi}, Primljeni koševi: ${tim.primljeniKosevi}`);
        });
    }

    console.log('\nEliminaciona faza:');
    let cetvrtfinale = kreirajCetvrtfinale(rangiranje);

    console.log('Četvrtfinale:');
    let polufinalisti = odigrajEliminacioneRunde(cetvrtfinale);

    console.log('\nPolufinale:');
    let finalisti = odigrajEliminacioneRunde([
        [polufinalisti[0], polufinalisti[1]],
        [polufinalisti[2], polufinalisti[3]],
    ]);
    
    console.log('\nUtakmica za treće mesto:');

    let gubitniciPolufinala = porazeniPolufinalista(polufinalisti, finalisti)
    let treceMesto = odigrajTreceMesto(gubitniciPolufinala[0], gubitniciPolufinala[1])
    
    console.log('\nFinale:');
    let pobednik = odigrajEliminacioneRunde([[finalisti[0], finalisti[1]]]);
    
    let drugoMesto = finalisti.find(tim => tim !== pobednik[0])

    
    console.log('\nOsvajač trećeg mesta:');
    console.log(treceMesto.Team);

    console.log('\nPobednik turnira:');
    console.log(pobednik[0].Team);

    console.log('\nPrva tri mesta');
    console.log(`\n1.${pobednik[0].Team}`);
    console.log(`\n2.${drugoMesto.Team}`);
    console.log(`\n3.${treceMesto.Team}`);

}

odigrajTurnir();
