function exists(debt) {
    if (!debt || typeof debt.principle === 'undefined' || typeof debt.payment === 'undefined' || debt.principle <= 0) {
        return false;
    }

    if (debt.payment < minimumPayment(debt.rate, 30 * 12, debt.principle)) {
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
    var interest = withInterest ? debt.principle * (debt.rate / 100 / 12) : 0;

    if (!payment || payment > ledger.currentBudget) {
        payment = ledger.currentBudget;
    }

    if (debt.principle < payment) {
        payment = debt.principle;
        interest = 0;
    }

    ledger.currentBudget -= payment;
    ledger.totalPaid += payment;
    ledger.totalPrincipal += payment - interest;
    debt.principle -= payment - interest;
    ledger.totalInterest += interest;
}

function process(debts, extra) {
    extra = extra || 0;

    var ledger = {
            totalInterest: 0,
            totalPaid: 0,
            totalMonths: 0,
            totalPrincipal: 0,
            monthlyBudget: extra + debts.reduce(function(sum, debt) {
                return sum + debt.payment;
            }, 0),
            history: []
        }, i;

    while (debts.filter(exists).length) {
        ledger.totalMonths += 1;
        ledger.currentBudget = ledger.monthlyBudget;

        for (i = 0; i < debts.length; i++) {
            if (debts[i].principle <= 0) continue;
            if (ledger.currentBudget <= 0) break;
            pay(debts[i], ledger, debts[i].payment, true);
        }

        for (i = 0; i < debts.length; i++) {
            if (debts[i].principle <= 0) continue;
            if (ledger.currentBudget <= 0) break;
            pay(debts[i], ledger, debts[i].principle);
        }

        ledger.history.push(debts.reduce(function(sum, debt) {
            return sum + debt.principle;
        }, 0));
    }

    return ledger;
}

function snowball(debts, extra) {
    return process(JSON.parse(JSON.stringify(debts)).filter(exists).sort(function(a, b) {
        return b.principle - a.principle;
    }), extra);
}

function avalanche(debts, extra) {
    return process(JSON.parse(JSON.stringify(debts)).filter(exists).sort(function(a, b) {
        return b.rate - a.rate;
    }), extra);
}

module.exports = {
    minimumPayment: minimumPayment,
    snowball: snowball,
    avalanche: avalanche,
    exists: exists
};
