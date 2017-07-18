import {Map} from "immutable";


const insertQueryArguments = (queryArgs:Map<string, any>, path:string, index:number):string => {
  const queryArgsKeys = queryArgs.keySeq();
  if (queryArgsKeys.get(index) !== undefined) {
    return insertQueryArguments(queryArgs, path.replace(`{${queryArgsKeys.get(index)}}`, queryArgs.get(queryArgsKeys.get(index))), index + 1);
  }
  return path;
};


export default (ajax, globalSwaggerLocation:Object, baseURL:string, onComplete: () => undefined) => {

  ajax.get(`${baseURL}/swagger/docs/v1?flatten=true`).then((res:{data:Map<string, any>}) => {
    const paths:Map<string, any> = res.data.get('paths');
    // window.client = paths.filter((methods, path) => path.match('/api/v1/'))
    globalSwaggerLocation = paths.mapEntries(([path, methods]:[string, Map<string, any>]) => {
        return [path.replace('/api/v1/', ''), methods.mapEntries(([method, info]:[string, Map<string, any>]) => {
          return [
            info.get('operationId'),
            info.set('api', (data:Map<string, any>, params = Map<string, any>(), queryArgs = Map<string, any>()) => {
              const pathWithArgs = insertQueryArguments(queryArgs, path, 0);
              return ajax.request({
                withCredentials: true,
                method,
                url: baseURL + pathWithArgs,
                data,
                params
              });
            })
          ]
        })];
      }
    ).flatten(1).groupBy(value => value.getIn(['tags', 0]));
    onComplete();
  });
}

