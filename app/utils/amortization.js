function exists(debt) {
    if (!debt || typeof debt.principal === 'undefined' || typeof debt.payment === 'undefined' || debt.principal <= 0) {
        return false;
    }

    if (debt.payment < minimumPayment(debt.rate, 30 * 12, debt.principal)) {
        return false;
    }

    return true;
}

function minimumPayment(rate, nper, pv) {
    var pvif, pmt;

    rate = (rate / 100 / 12);

    pvif = Math.pow( 1 + rate, nper);
    pmt = rate / (pvif - 1) * -(pv * -1 * pvif);

    return pmt;
}

function pay(debt, ledger, payment, withInterest) {
    var interest = withInterest ? debt.principal * ((debt.rate || 0) / 100 / 12) : 0;

    if (!payment || payment > ledger.currentBudget) {
        payment = ledger.currentBudget;
    }

    if (debt.principal < payment) {
        payment = debt.principal;
        interest = 0;
    }

    ledger.currentBudget -= payment;
    ledger.totalPaid += payment;
    debt.principal -= payment - interest;
    ledger.totalInterest += interest;
}

function process(debts, extra) {
    extra = extra || 0;

    var ledger = {
            totalInterest: 0,
            totalPaid: 0,
            totalMonths: 0,
            totalPrincipal: 0,
            totalPayment: debts.reduce(function(sum, debt) {
                return sum + debt.payment;
            }, 0),
            monthlyBudget: extra + debts.reduce(function(sum, debt) {
                return sum + debt.payment;
            }, 0),
            totalPrincipal: debts.reduce(function(sum, debt) {
                return sum + debt.principal;
            }, 0),
            history: []
        }, i;

    while (debts.filter(exists).length) {
        ledger.totalMonths += 1;
        ledger.currentBudget = ledger.monthlyBudget;

        for (i = 0; i < debts.length; i++) {
            if (debts[i].principal <= 0) continue;
            if (ledger.currentBudget <= 0) break;
            pay(debts[i], ledger, debts[i].payment, true);
        }

        for (i = 0; i < debts.length; i++) {
            if (debts[i].principal <= 0) continue;
            if (ledger.currentBudget <= 0) break;
            pay(debts[i], ledger, debts[i].principal);
        }

        ledger.history.push(debts.reduce(function(sum, debt) {
            return sum + debt.principal;
        }, 0));
    }

    return ledger;
}

function snowball(debts, extra) {
    return process(JSON.parse(JSON.stringify(debts)).filter(exists).sort(function(a, b) {
        return b.principal - a.principal;
    }), extra);
}

function avalanche(debts, extra) {
    return process(JSON.parse(JSON.stringify(debts)).filter(exists).sort(function(a, b) {
        return b.rate - a.rate;
    }), extra);
}

function consolidated(debts, extra, consolidatedRate) {
    debts = JSON.parse(JSON.stringify(debts)).filter(exists);

    var principal = debts.reduce(function(sum, d) {
            return sum + d.principal;
        }, 0),
        payment = debts.reduce(function(sum, d) {
            return sum + d.payment;
        }, 0);

    return process([{
        principal: principal,
        payment: payment,
        rate: consolidatedRate || 0
    }], extra);
}

module.exports = {
    minimumPayment: minimumPayment,
    snowball: snowball,
    avalanche: avalanche,
    consolidated: consolidated,
    exists: exists
};
