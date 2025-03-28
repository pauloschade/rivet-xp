export interface ParamSet {
  ipca_delta_mean_last_3: number
  selic_delta_mean_last_3: number
  cambio_delta_mean_last_3: number
  intercept: number
}

export type RegressionParams = {
  [profile: string]: {
    [asset: string]: ParamSet
  }
}

export const regressionParams: RegressionParams = {
  conservador_delta: {
    alternativos: {
      ipca_delta_mean_last_3: -0.00403879999259785,
      selic_delta_mean_last_3: -0.0790254392750269,
      cambio_delta_mean_last_3: -0.22036821379782445,
      intercept: 0.002767625670527976
    },
    fundos: {
      ipca_delta_mean_last_3: -0.49236565529656323,
      selic_delta_mean_last_3: 0.16178782767835517,
      cambio_delta_mean_last_3: 0.4992715601593144,
      intercept: 0.023412425354227287
    },
    inflacao: {
      ipca_delta_mean_last_3: 0.21083913946187985,
      selic_delta_mean_last_3: -0.2592804225184523,
      cambio_delta_mean_last_3: 0.6229201570640733,
      intercept: 0.5845433291942306
    },
    multimercados: {
      ipca_delta_mean_last_3: 0.7763532348854331,
      selic_delta_mean_last_3: -0.39676950196553123,
      cambio_delta_mean_last_3: -0.9197917709928486,
      intercept: -0.06876441459012106
    },
    posfixado: {
      ipca_delta_mean_last_3: 0.25580944267867634,
      selic_delta_mean_last_3: 0.8320755004313217,
      cambio_delta_mean_last_3: 0.1619180836650789,
      intercept: -0.5763672476395798
    },
    prefixado: {
      ipca_delta_mean_last_3: -0.6654821313376413,
      selic_delta_mean_last_3: -0.08736226244884746,
      cambio_delta_mean_last_3: 0.3313711427105673,
      intercept: -0.12398665743429525
    },
    renda_fixa_global: {
      ipca_delta_mean_last_3: -0.27403484107697057,
      selic_delta_mean_last_3: 0.08358963535106469,
      cambio_delta_mean_last_3: -0.5551024639086547,
      intercept: 0.001583865337194016
    },
    renda_var_br: {
      ipca_delta_mean_last_3: -0.00403879999259785,
      selic_delta_mean_last_3: -0.0790254392750269,
      cambio_delta_mean_last_3: -0.22036821379782445,
      intercept: 0.002767625670527976
    },
    renda_var_global: {
      ipca_delta_mean_last_3: 0.1969584106703809,
      selic_delta_mean_last_3: -0.1759898979778563,
      cambio_delta_mean_last_3: 0.30014971889811837,
      intercept: 0.15404344843728815
    }
  },
  moderado_delta: {
    alternativos: {
      ipca_delta_mean_last_3: 0.38034514453414525,
      selic_delta_mean_last_3: -0.3915536494107215,
      cambio_delta_mean_last_3: -0.9661317448065909,
      intercept: 0.1333878623591172
    },
    fundos: {
      ipca_delta_mean_last_3: -0.3888347800314048,
      selic_delta_mean_last_3: 0.212828666795293,
      cambio_delta_mean_last_3: -0.36818500477153215,
      intercept: -0.3239726200882501
    },
    inflacao: {
      ipca_delta_mean_last_3: -0.17449662291727208,
      selic_delta_mean_last_3: 0.1419296768290329,
      cambio_delta_mean_last_3: 0.6436446157073497,
      intercept: 0.4387901875190463
    },
    multimercados: {
      ipca_delta_mean_last_3: 0.6715801142760902,
      selic_delta_mean_last_3: -0.4755676588073267,
      cambio_delta_mean_last_3: -0.743553051865308,
      intercept: -0.028517678595712748
    },
    posfixado: {
      ipca_delta_mean_last_3: -2.968161225503917,
      selic_delta_mean_last_3: 2.0984100302404864,
      cambio_delta_mean_last_3: 2.427189061605574,
      intercept: 0.4293149177258553
    },
    prefixado: {
      ipca_delta_mean_last_3: -0.04590797509695356,
      selic_delta_mean_last_3: -0.22921062897959962,
      cambio_delta_mean_last_3: 0.7797056380296633,
      intercept: -0.07800493806389923
    },
    renda_fixa_global: {
      ipca_delta_mean_last_3: 0.2847730887398157,
      selic_delta_mean_last_3: -0.022426178736048994,
      cambio_delta_mean_last_3: -0.811197739085904,
      intercept: -0.18596443779282001
    },
    renda_var_br: {
      ipca_delta_mean_last_3: 0.8877355523206131,
      selic_delta_mean_last_3: -0.7249324642338019,
      cambio_delta_mean_last_3: -0.07341502286457596,
      intercept: -0.2617238997022652
    },
    renda_var_global: {
      ipca_delta_mean_last_3: 1.3529667036788837,
      selic_delta_mean_last_3: -0.6094777936973135,
      cambio_delta_mean_last_3: -0.8880567519486773,
      intercept: -0.1233093933610715
    }
  },
  sofisticado_delta: {
    alternativos: {
      ipca_delta_mean_last_3: 0.028087893297062443,
      selic_delta_mean_last_3: -0.2709718296503721,
      cambio_delta_mean_last_3: -0.6302154970224527,
      intercept: 0.20792638872066943
    },
    fundos: {
      ipca_delta_mean_last_3: 0.4094285037835457,
      selic_delta_mean_last_3: 0.05919188927423091,
      cambio_delta_mean_last_3: -0.813404176921706,
      intercept: -0.37081453644231843
    },
    inflacao: {
      ipca_delta_mean_last_3: -0.7942257831702566,
      selic_delta_mean_last_3: 0.47164698538946254,
      cambio_delta_mean_last_3: 1.5262600010653604,
      intercept: 0.7708953017414305
    },
    multimercados: {
      ipca_delta_mean_last_3: -0.3640440354063778,
      selic_delta_mean_last_3: -0.12938181113432345,
      cambio_delta_mean_last_3: -0.2676115101110194,
      intercept: 0.20153259163344175
    },
    posfixado: {
      ipca_delta_mean_last_3: -0.6835887160926958,
      selic_delta_mean_last_3: 1.1919255088576746,
      cambio_delta_mean_last_3: 0.2924820632111951,
      intercept: 0.10632883193956577
    },
    prefixado: {
      ipca_delta_mean_last_3: -1.6493167993119622,
      selic_delta_mean_last_3: 0.09394492109193842,
      cambio_delta_mean_last_3: 1.7469192814603447,
      intercept: -0.13247263993782418
    },
    renda_fixa_global: {
      ipca_delta_mean_last_3: -0.585398192049293,
      selic_delta_mean_last_3: 0.020968886198604954,
      cambio_delta_mean_last_3: 0.1505745377541106,
      intercept: -0.03163641880543198
    },
    renda_var_br: {
      ipca_delta_mean_last_3: 2.5791371389502262,
      selic_delta_mean_last_3: -1.1031132615221382,
      cambio_delta_mean_last_3: -1.142306585232876,
      intercept: -0.40906679528741274
    },
    renda_var_global: {
      ipca_delta_mean_last_3: 1.05991998999975,
      selic_delta_mean_last_3: -0.33421128850507664,
      cambio_delta_mean_last_3: -0.8626981142029579,
      intercept: -0.3426927235621206
    }
  }
}