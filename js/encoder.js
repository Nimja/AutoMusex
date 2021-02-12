class GridEncoder {
    encode(grid) {
        let result = [];
        for (var i = 0; i < grid.length; i++) {
            let c = grid[i];
            if (c == DIR_NONE) {
                continue;
            }
            result.push(this.getIndexToChar(i));
            var steps = Array.isArray(c) ? c : [c];
            for (var cc in steps) {
                result.push(steps[cc]);
            }
        }
        return result.join('');
    }
    getIndexToChar(i) {
        // Max 2 chars, A = 0. Z = 25, a = 26
        let max = 52,
            first = Math.floor(i / max),
            second = i - first * max;
        let result = first ? this.getValToChar(first) : '';
        result += this.getValToChar(second);
        return result;
    }
    getValToChar(c) {
        // 97 = small a, 65 = cap A.
        c += (c > 25) ? 97 - 26 : 65;
        return String.fromCharCode(c);
    }
    getCharToVal(char) {
        let val = char.charCodeAt(0);
    }

    decode(grid, string) {
        grid.fill(DIR_NONE);
        const matches = string.matchAll(/([A-Za-z]+)([0-9]+)/g);
        for (const match of matches) {
            let index = this.getCharToIndex(match[1]);
            if (index > grid.length) {
                continue;
            }
            let c = match[2].split('');
            c.map(parseInt);
            if (c.length == 1) {
                c = c[0];
            }
            grid[index] = c;
        }
    }
    getCharToIndex(chars) {
        let result = 0;
        let i = 0;
        if (chars.length == 2) {
            result += 52 * this.getCharValue(chars[i]);
            i++;
        }
        result += this.getCharValue(chars[i]);
        return result;
    }
    getCharValue(char) {
        let result = char.charCodeAt(0);
        if (result >= 97) {
            result -= 97 - 26;
        } else {
            result -= 65;
        }
        return result;
    }
}