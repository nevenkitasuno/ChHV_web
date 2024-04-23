// scroll

const bindSyncScrolling = (one, two) => {
    let echo = false,
    sync = (one, two) => () => 
      (echo = !echo) && (
        one.scrollTop = two.scrollTop,
        one.scrollLeft = two.scrollLeft
      )
    ;
    two.onscroll = sync(one, two);
    one.onscroll = sync(two, one);
  };

// time kostyl

function adjustForTimezone(date) {
    var timeOffsetInMS = date.getTimezoneOffset() * 60000;
    date.setTime(date.getTime() + timeOffsetInMS);
    return date
}

// converters

function StrToDatetime(line) {
    if (line[1] === ':') {
        return (new Date(1970, 1, 1, line[0], line[2] + line[3]))
    }

    return (new Date(1970, 1, 1, line[0] + line[1], line[3] + line[4]))
}

// also acts as TimedeltaToStr
function DatetimeToStrKostyl(inp) {
    let hhmm = adjustForTimezone(inp).toTimeString();

    if (hhmm[0] === '0') {
        return (hhmm.substring(1, 5))
    }

    return (hhmm.substring(0, 5))
}

function DatetimeToStr(inp) { // time_start, time_finish
    let hhmm = inp.toTimeString();

    if (hhmm[0] === '0') {
        return (hhmm.substring(1, 5))
    }

    return (hhmm.substring(0, 5))
}

// LineParse

// TODO: typescript have true enums
/*
class e_LineType {
    other = 1;
    day_number = 2;
    halt = 3;
    start = 4;
    finish = 5;
}
*/

function GetLineType(line) {
    var regexes = {
        2: /День \d{1,2}/, // day_number
        3: /\d{1,2}:\d{2} - \d{1,2}:\d{2} (привал|остановились|остановка)/, // halt
        4: /\d{1,2}:\d{2} (вышли)/, // start
        5: /\d{1,2}:\d{2} (встали)/
    } // finish

    for (var type in regexes) {
        var regex = regexes[type];
        if (line.match(regex)) {
            return (type);
        }
    }

    return 1; // other
}

// ch_h_v

function GetHaltTimeMilisec(line) {
    const parts = line.split(' - ')
    return new StrToDatetime(parts[1]) - StrToDatetime(parts[0]) // time_resume - time_pause
}

function GetChHV(inp, verbose) {
    let res = [], line, type, day_line, time_start, halt_per_day, time_finish, total_day_time;

    for (var i = 0; i < inp.length; i++) {
        line = inp[i]
        type = GetLineType(line)
        switch (type) {
            case '2': // e_LineType.day_number
                // day started
                day_line = line;
                if (verbose) {
                    res.push(day_line)
                }
                break;
            // halt time count
            case '4': // e_LineType.start
                time_start = StrToDatetime(line);
                halt_per_day = 0;
                res.push("")
                break;
            case '3': // e_LineType.halt
                halt_per_day += GetHaltTimeMilisec(line);
                if (verbose) {
                    res.push(DatetimeToStrKostyl(new Date(halt_per_day)))
                }
                break;
            case '5': // e_LineType.finish
                // day finished
                time_finish = StrToDatetime(line)
                halt_per_day = new Date(halt_per_day)
                total_day_time = new Date(time_finish - time_start - halt_per_day)
                if (verbose) {
                    res.push(day_line + " ЧХВ = "
                        + DatetimeToStr(time_finish)
                        + " - " + DatetimeToStr(time_start)
                        + " - " + DatetimeToStrKostyl(halt_per_day)
                        + " = " + DatetimeToStrKostyl(total_day_time))
                }
                else {
                    res.push(day_line + ' ЧХВ = ' + DatetimeToStrKostyl(total_day_time))
                }
                break;
            default:
                res.push("")
                break;
        }
    }

    return res;
}

// main

const inp = document.getElementById("message");
const outp = document.getElementById("output");

inp.addEventListener("input", PrintChHV);

bindSyncScrolling(inp, outp);

inp.value = `День 1
12:40 вышли к перeвалу;
12:55 - 13:00 привал
13:35 - 13:40 привал, прошли 700 м. Тропа каменистая, но машины ездят.
18:33 - 18:42 остановились на ручье, пополнить запасы воды
19:03 - 19:10 привал. Закончилась лесная зона, идёт ровный, травянистый зелёный склон. уклон 15 градусов. Тропа пропала.
Туман, видимость 75 м.
20:30 - 20:37 привал, снова дорога, вышли на ворота шёлкового пути. Сняли записку.
20:47 встали на ночёвку после ворот, тропа уклон 10 градусов просматривается, 10:30 отбой.

День 2
4:30 подъём дежурного, 5:10 завтрак, общ подъём, ясно, прохладно, не верится что должен накрыть дождь, состояние групы хорошее
6:15 вышли, тепло.
6:25 - 6:40 остановились на родник
7:05 - 7:20 привал, встретили кош, накатанная грунтовая дорога по хребту, встали на перевале нк, продолжаем траверс хребта. Видим место запланированной ночёвки 1 (до которой не дошли вчера 500 м.)
10:37 - 11:15 остановились на разведку в связи с погодой - с севера тянутся тучи. Нашли тропу с туриками к вершине, идём по ней. Снежники по пути, обходим их по травянистым склонам.
12:30 - 14:22 остановились на обед у вершины.
14:43 - 14:48 привал технический. надеваем куртки, вышли на тропу. Оставим вершину левее, пойдём к перевалу. Туман, видимость 20-25 м.
Ведём подъём по травянистому склону. Дорога к вершине горизонтальна. При подходе к вершине есть дорога насыпная вправо от вершины к перевалу. Дорога хорошо читается. Видимость прежняя.
15:00 - 15:04 привал технический - разведка
16:12 - 16:20 остановились на роднике
16:30 - 16:55 остановились сделать фотографии. видимость улучшилась, стала 500м - 1км. Спустились с перевала в нап. места ночёвки. Туман, облачно
18:00 встали на месте ночёвки. пасмурно, холодает. было принято решение отменить радиальный выход в связи с видимостью 100-150 м (видна только седловина перевала).
Встали на ночёвку в предпологаемом месте, коша нет. +15 градусов
Пошёл дождь`

PrintChHV()

function PrintChHV() {
    const txt = inp.value;
    const result = GetChHV(txt.split(/\r?\n/), true);

    outp.value = "";
    result.forEach(el => {
        outp.value += el
        outp.value += "\n"
    });

    /* when it was <p> tags inside outp div
    outp.innerHTML = "";
    result.forEach(el => {
        let para = document.createElement("p");
        para.textContent = el;
        outp.appendChild(para);
    });
    */
}